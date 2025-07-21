# app/controllers/api/v1/people_controller.rb
module Api
  module V1
    class PeopleController < BaseController
      before_action :set_person, only: %i[show update destroy tree relatives]

      # GET /api/v1/people
      def index
        people = current_user.people
        render json: people, each_serializer: Api::V1::PersonSerializer, status: :ok
      end

      # GET /api/v1/people/:id
      def show
        render json: @person, serializer: Api::V1::PersonSerializer, status: :ok
      end

      # POST /api/v1/people
      def create
        Rails.logger.info "[PeopleController#create] Params: \n#{params.inspect}"
        ActiveRecord::Base.transaction do
          person = current_user.people.build(person_params)
          is_first_person = current_user.people.count == 0
          rel_type = params[:person][:relation_type]
          rel_person_id = params[:person][:related_person_id]
          # Require relationship fields unless first person
          if !is_first_person && (rel_type.blank? || rel_person_id.blank?)
            render json: { errors: [ "Relationship Type and Selected Person are required" ] }, status: :unprocessable_entity
            raise ActiveRecord::Rollback
          end
          if person.save
            # If relationship_type and related_person_id are provided, create relationship
            if rel_type.present? && rel_person_id.present?
              related_person = current_user.people.find(rel_person_id)
              
              # COMPREHENSIVE PARENT-CHILD VALIDATION
              if ['child', 'parent'].include?(rel_type)
                if rel_type == 'child'
                  # New person is child, selected person is parent
                  validation_result = related_person.can_be_parent_of?(person)
                elsif rel_type == 'parent'
                  # New person is parent, selected person is child
                  validation_result = person.can_be_parent_of?(related_person)
                end

                unless validation_result[:valid]
                  render json: { 
                    errors: [validation_result[:error]]
                  }, status: :unprocessable_entity
                  raise ActiveRecord::Rollback
                end
              end
              
              # Create the correct relationship based on what the user selected
              case rel_type
              when 'child'
                # New person is a child of the selected person
                # So the selected person is the parent of the new person
                Relationship.create!(person_id: rel_person_id, relative_id: person.id, relationship_type: 'child')
                Relationship.create!(person_id: person.id, relative_id: rel_person_id, relationship_type: 'parent')
                # Sibling relationships will be automatically created via the Relationship model callback
              when 'parent'
                # New person is a parent of the selected person
                # So the new person is the parent of the selected person
                Relationship.create!(person_id: person.id, relative_id: rel_person_id, relationship_type: 'child')
                Relationship.create!(person_id: rel_person_id, relative_id: person.id, relationship_type: 'parent')
                # Sibling relationships will be automatically created via the Relationship model callback
              when 'spouse'
                # Bidirectional spouse relationship
                Relationship.create!(person_id: person.id, relative_id: rel_person_id, relationship_type: 'spouse')
                Relationship.create!(person_id: rel_person_id, relative_id: person.id, relationship_type: 'spouse')
              when 'sibling'
                # Bidirectional sibling relationship
                Relationship.create!(person_id: person.id, relative_id: rel_person_id, relationship_type: 'sibling')
                Relationship.create!(person_id: rel_person_id, relative_id: person.id, relationship_type: 'sibling')
              end
            end
            Rails.logger.info "[PeopleController#create] Person created: \n#{person.inspect}"
            
            # Success response with person data and success message
            render json: {
              person: Api::V1::PersonSerializer.new(person).as_json,
              message: "#{person.first_name} #{person.last_name} has been successfully added to the family tree!",
              success: true
            }, status: :created
          else
            Rails.logger.error "[PeopleController#create] Failed to create person: \n#{person.errors.full_messages}"
            render json: { errors: person.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end

      # PATCH /api/v1/people/:id
      def update
        ActiveRecord::Base.transaction do
          # RELATIONSHIP-AWARE DATE VALIDATION for existing person
          new_birth_date = params[:person][:date_of_birth]
          new_death_date = params[:person][:date_of_death]
          
          # Validate birth date against existing relationships
          if new_birth_date.present?
            birth_date = Date.parse(new_birth_date.to_s)
            
            # Check if new birth date conflicts with children (must be at least 12 years before children's birth)
            @person.children.each do |child|
              if child.date_of_birth.present?
                child_birth = Date.parse(child.date_of_birth.to_s)
                age_diff = (child_birth - birth_date) / 365.25
                
                if age_diff < 12
                  error_msg = if age_diff < 0
                    "Cannot update birth date. #{@person.first_name} #{@person.last_name} would be #{age_diff.abs.round(1)} years YOUNGER than their child #{child.first_name} #{child.last_name} (born #{child_birth.strftime('%B %d, %Y')})."
                  else
                    "Cannot update birth date. #{@person.first_name} #{@person.last_name} would be only #{age_diff.round(1)} years older than their child #{child.first_name} #{child.last_name} (born #{child_birth.strftime('%B %d, %Y')}). A parent must be at least 12 years older than their child."
                  end
                  
                  render json: { errors: [error_msg] }, status: :unprocessable_entity
                  raise ActiveRecord::Rollback
                end
              end
            end
            
            # Check if new birth date conflicts with parents (must be at least 12 years after parents' birth)
            @person.parents.each do |parent|
              if parent.date_of_birth.present?
                parent_birth = Date.parse(parent.date_of_birth.to_s)
                age_diff = (birth_date - parent_birth) / 365.25
                
                if age_diff < 12
                  error_msg = if age_diff < 0
                    "Cannot update birth date. #{@person.first_name} #{@person.last_name} would be #{age_diff.abs.round(1)} years OLDER than their parent #{parent.first_name} #{parent.last_name} (born #{parent_birth.strftime('%B %d, %Y')})."
                  else
                    "Cannot update birth date. #{parent.first_name} #{parent.last_name} (born #{parent_birth.strftime('%B %d, %Y')}) would be only #{age_diff.round(1)} years older than #{@person.first_name} #{@person.last_name}. A parent must be at least 12 years older than their child."
                  end
                  
                  render json: { errors: [error_msg] }, status: :unprocessable_entity
                  raise ActiveRecord::Rollback
                end
              end
            end
            
            # Check if new birth date is after current death date
            current_death_date = @person.date_of_death || (new_death_date.present? ? Date.parse(new_death_date.to_s) : nil)
            if current_death_date && birth_date > current_death_date
              render json: { 
                errors: ["Birth date cannot be after death date. Birth: #{birth_date.strftime('%B %d, %Y')}, Death: #{current_death_date.strftime('%B %d, %Y')}."] 
              }, status: :unprocessable_entity
              raise ActiveRecord::Rollback
            end
            
            # Check marriage age validation if person has spouses
            spouse_relationships = @person.relationships.where(relationship_type: "spouse") + 
                                 @person.related_by_relationships.where(relationship_type: "spouse")
            
            if spouse_relationships.any?
              age = ((Date.current - birth_date).to_f / 365.25).round(1)
              if age < 16
                error_msg = "Cannot update birth date. #{@person.first_name} #{@person.last_name} would be only #{age} years old. Minimum marriage age is 16 years."
                render json: { errors: [error_msg] }, status: :unprocessable_entity
                raise ActiveRecord::Rollback
              end
            end
          end
          
          # Validate death date against existing relationships  
          if new_death_date.present?
            death_date = Date.parse(new_death_date.to_s)
            
            # Check if new death date is before children's birth dates
            @person.children.each do |child|
              if child.date_of_birth.present?
                child_birth = Date.parse(child.date_of_birth.to_s)
                
                if death_date < child_birth
                  render json: { 
                    errors: ["Cannot set death date before child's birth. #{@person.first_name} #{@person.last_name} would die on #{death_date.strftime('%B %d, %Y')}, but their child #{child.first_name} #{child.last_name} was born on #{child_birth.strftime('%B %d, %Y')}."] 
                  }, status: :unprocessable_entity
                  raise ActiveRecord::Rollback
                end
              end
            end
            
            # Check if new death date is before current birth date
            current_birth_date = @person.date_of_birth || (new_birth_date.present? ? Date.parse(new_birth_date.to_s) : nil)
            if current_birth_date && death_date < current_birth_date
              render json: { 
                errors: ["Death date cannot be before birth date. Birth: #{current_birth_date.strftime('%B %d, %Y')}, Death: #{death_date.strftime('%B %d, %Y')}."] 
              }, status: :unprocessable_entity
              raise ActiveRecord::Rollback
            end
          end
          
          # If all validations pass, update the person
          if @person.update(person_params)
            render json: {
              person: Api::V1::PersonSerializer.new(@person).as_json,
              message: "#{@person.first_name} #{@person.last_name} has been successfully updated!"
            }, status: :ok
          else
            render json: { errors: @person.errors.full_messages }, status: :unprocessable_entity
            raise ActiveRecord::Rollback
          end
        end
      end

      # DELETE /api/v1/people/:id
      def destroy
        @person.destroy
        head :no_content
      end

      # GET /api/v1/people/:id/tree
      def tree
        # return the full subtree of ancestors, spouses, siblings, children
        nodes, edges = People::TreeBuilder.new(@person).as_json
        render json: {
          nodes: ActiveModelSerializers::SerializableResource.new(nodes, each_serializer: Api::V1::PersonSerializer),
          edges: edges
        }, status: :ok
      end

      # GET /api/v1/people/:id/relatives
      def relatives
        rels = {
          parents:  @person.parents,
          spouses:  @person.spouses,
          children: @person.children
        }
        render json: rels, status: :ok
      end

      # GET /api/v1/people/tree
      def full_tree
        Rails.logger.info "=== FULL_TREE ENDPOINT CALLED ==="
        people = current_user.people
        nodes = people.to_a
        edges = []
        
        Rails.logger.info "=== FULL TREE DEBUG ==="
        Rails.logger.info "User #{current_user.id} has #{people.count} people"
        Rails.logger.info "Total relationships in database: #{Relationship.count}"
        
        people.each do |person|
          person_relationships = person.relationships
          Rails.logger.info "Person #{person.id} (#{person.first_name} #{person.last_name}) has #{person_relationships.count} relationships"
          
          person_relationships.each do |rel|
            # Only include edges where both people are in the user's tree
            if people.map(&:id).include?(rel.relative_id)
              edge = {
                source: person.id,
                target: rel.relative_id,
                relationship_type: rel.relationship_type
              }
              # Include is_ex and is_deceased attributes for spouse relationships
              if rel.relationship_type == 'spouse'
                edge[:is_ex] = rel.is_ex
                edge[:is_deceased] = rel.is_deceased
              end
              edges << edge
            end
          end
        end
        
        # Find the oldest person with relationships to use as default root
        oldest_person = people.joins(:relationships).where.not(date_of_birth: nil).order(:date_of_birth).first
        # Fallback to oldest person if no one has relationships
        oldest_person ||= people.where.not(date_of_birth: nil).order(:date_of_birth).first
        
        render json: {
          nodes: ActiveModelSerializers::SerializableResource.new(nodes, each_serializer: Api::V1::PersonSerializer),
          edges: edges,
          oldest_person_id: oldest_person&.id
        }, status: :ok
      end

      private

      def set_person
        @person = current_user.people.find(params[:id])
      end

      def person_params
        params.require(:person).permit(
          :first_name, :last_name,
          :date_of_birth, :date_of_death,
          :gender, :is_deceased
        )
      end
    end
  end
end
