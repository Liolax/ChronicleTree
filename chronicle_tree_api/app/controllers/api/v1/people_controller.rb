# Chronicle Tree Project - Main API controller for family tree management
# Handles person creation, relationship building, and genealogical data validation
module Api
  module V1
    class PeopleController < BaseController
      before_action :set_person, only: %i[show update destroy tree relatives]

      def index
        people = current_user.people
        render json: people, each_serializer: Api::V1::PersonSerializer, status: :ok
      end

      def show
        render json: @person, serializer: Api::V1::PersonSerializer, status: :ok
      end

      def create
        ActiveRecord::Base.transaction do
          person = current_user.people.build(person_params)
          is_first_person = current_user.people.count == 0
          rel_type = params[:person][:relation_type]
          rel_person_id = params[:person][:related_person_id]
          if !is_first_person && (rel_type.blank? || rel_person_id.blank?)
            render json: { errors: [ "Please select both a relationship type and a person to connect to. Both fields are required when adding new family members." ] }, status: :unprocessable_entity
            raise ActiveRecord::Rollback
          end
          if person.save
            if rel_type.present? && rel_person_id.present?
              related_person = current_user.people.find(rel_person_id)
              
              # Parent-child age validation
              if ['child', 'parent'].include?(rel_type)
                if rel_type == 'child'
                  validation_result = related_person.can_be_parent_of?(person)
                elsif rel_type == 'parent'
                  validation_result = person.can_be_parent_of?(related_person)
                end

                unless validation_result[:valid]
                  render json: { 
                    errors: [validation_result[:error]]
                  }, status: :unprocessable_entity
                  raise ActiveRecord::Rollback
                end
              end
              
              case rel_type
              when 'child'
                Relationship.create!(person_id: rel_person_id, relative_id: person.id, relationship_type: 'child')
                Relationship.create!(person_id: person.id, relative_id: rel_person_id, relationship_type: 'parent')
              when 'parent'
                Relationship.create!(person_id: person.id, relative_id: rel_person_id, relationship_type: 'child')
                Relationship.create!(person_id: rel_person_id, relative_id: person.id, relationship_type: 'parent')
              when 'spouse'
                # Determine if this should be an ex-spouse relationship
                # If new person is deceased or if selected person already has a current spouse
                is_ex_spouse = person.date_of_death.present?
                
                # Check if selected person already has a current spouse (only if this is not an ex-spouse)
                if !is_ex_spouse && related_person.current_spouses.any?
                  current_spouse_names = related_person.current_spouses.map(&:full_name).join(', ')
                  render json: { 
                    errors: ["#{related_person.full_name} already has a current spouse (#{current_spouse_names}). A person can only have one current spouse at a time. If you want to add #{person.full_name} as a spouse, you'll need to mark the existing marriage as ended first, or set #{person.full_name} as deceased to add them as a former spouse."]
                  }, status: :unprocessable_entity
                  raise ActiveRecord::Rollback
                end
                
                Relationship.create!(
                  person_id: person.id, 
                  relative_id: rel_person_id, 
                  relationship_type: 'spouse',
                  is_ex: is_ex_spouse
                )
                Relationship.create!(
                  person_id: rel_person_id, 
                  relative_id: person.id, 
                  relationship_type: 'spouse',
                  is_ex: is_ex_spouse
                )
              when 'sibling'
                Relationship.create!(person_id: person.id, relative_id: rel_person_id, relationship_type: 'sibling')
                Relationship.create!(person_id: rel_person_id, relative_id: person.id, relationship_type: 'sibling')
              end
            end
            
            # Generate appropriate success message
            success_message = "#{person.first_name} #{person.last_name} has been successfully added to the family tree!"
            
            # Add additional context for ex-spouse relationships
            if rel_type == 'spouse' && person.date_of_death.present?
              success_message += " Since #{person.first_name} is marked as deceased, they were added as a former spouse."
            end
            
            render json: {
              person: Api::V1::PersonSerializer.new(person).as_json,
              message: success_message,
              success: true
            }, status: :created
          else
            render json: { errors: person.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end

      def update
        ActiveRecord::Base.transaction do
          # Date validation logic
          new_birth_date = params[:person][:date_of_birth]
          new_death_date = params[:person][:date_of_death]
          
          if new_birth_date.present?
            birth_date = Date.parse(new_birth_date.to_s)
            
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
            
            current_death_date = @person.date_of_death || (new_death_date.present? ? Date.parse(new_death_date.to_s) : nil)
            if current_death_date && birth_date > current_death_date
              render json: { 
                errors: ["Birth date cannot be after death date. Birth: #{birth_date.strftime('%B %d, %Y')}, Death: #{current_death_date.strftime('%B %d, %Y')}."] 
              }, status: :unprocessable_entity
              raise ActiveRecord::Rollback
            end
            
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
          
  
          if new_death_date.present?
            death_date = Date.parse(new_death_date.to_s)
            
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
            
            current_birth_date = @person.date_of_birth || (new_birth_date.present? ? Date.parse(new_birth_date.to_s) : nil)
            if current_birth_date && death_date < current_birth_date
              render json: { 
                errors: ["Death date cannot be before birth date. Birth: #{current_birth_date.strftime('%B %d, %Y')}, Death: #{death_date.strftime('%B %d, %Y')}."] 
              }, status: :unprocessable_entity
              raise ActiveRecord::Rollback
            end
          end
          
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

      def destroy
        @person.destroy
        head :no_content
      end

      def tree
        nodes, edges = People::TreeBuilder.new(@person).as_json
        render json: {
          nodes: ActiveModelSerializers::SerializableResource.new(nodes, each_serializer: Api::V1::PersonSerializer),
          edges: edges
        }, status: :ok
      end

      def relatives
        rels = {
          parents:  @person.parents,
          spouses:  @person.spouses,
          children: @person.children,
          full_siblings: @person.full_siblings,
          half_siblings: @person.half_siblings,
          step_siblings: @person.step_siblings
        }
        render json: rels, status: :ok
      end

      # Relationship statistics endpoint
      def relationship_stats
        begin
          people = current_user.people
          
          relationships = []
          people.each do |person|
            person.relationships.each do |rel|
                if people.map(&:id).include?(rel.relative_id)
                relationships << {
                  source: person.id,
                  target: rel.relative_id,
                  relationship_type: rel.relationship_type,
                  is_ex: rel.is_ex || false,
                  is_deceased: rel.is_deceased || false
                }
              end
            end
          end

          stats = calculate_relationship_statistics(@person, people.to_a, relationships)
          
          render json: {
            person_id: @person.id,
            statistics: stats,
            success: true
          }, status: :ok
          
        rescue StandardError => e
          Rails.logger.error "Relationship stats calculation failed: #{e.message}"
          Rails.logger.error e.backtrace.join("\n")
          render json: { 
            error: 'Failed to calculate relationship statistics',
            message: e.message,
            person_id: params[:id]
          }, status: :internal_server_error
        end
      end

      def full_tree
        people = current_user.people
        nodes = people.to_a
        edges = []
        
        
        people.each do |person|
          person_relationships = person.relationships
          
          person_relationships.each do |rel|
            if people.map(&:id).include?(rel.relative_id)
              edge = {
                source: person.id,
                target: rel.relative_id,
                relationship_type: rel.relationship_type
              }
              if rel.relationship_type == 'spouse'
                edge[:is_ex] = rel.is_ex
                edge[:is_deceased] = rel.is_deceased
              end
              edges << edge
            end
          end
        end
        
        oldest_person = people.joins(:relationships).where.not(date_of_birth: nil).order(:date_of_birth).first
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

      # Relationship statistics calculation
      def calculate_relationship_statistics(person, all_people, relationships)
        stats = {
          children: 0,
          step_children: 0,
          spouses: 0,
          ex_spouses: 0,
          siblings: 0,
          step_siblings: 0,
          parents: 0,
          step_parents: 0,
          total_relatives: 0
        }

        # Count biological children
        biological_children = relationships.select do |rel|
          rel[:source] == person.id && rel[:relationship_type] == 'child'
        end
        stats[:children] = biological_children.count

        # Count step-children through current/deceased spouses (NOT ex-spouses)
        current_and_deceased_spouses = relationships.select do |rel|
          rel[:source] == person.id && 
          rel[:relationship_type] == 'spouse' && 
          !rel[:is_ex]  # Only current and deceased, not ex
        end

        step_children_count = 0
        current_and_deceased_spouses.each do |spouse_rel|
          spouse_id = spouse_rel[:target]
          
          # Find spouse's children who are not also person's biological children
          spouse_children = relationships.select do |rel|
            rel[:source] == spouse_id && rel[:relationship_type] == 'child'
          end
          
          spouse_children.each do |child_rel|
            # Check if this child is also person's biological child
            is_biological_child = biological_children.any? { |bio_rel| bio_rel[:target] == child_rel[:target] }
            step_children_count += 1 unless is_biological_child
          end
        end
        stats[:step_children] = step_children_count

        # Count current spouses (not ex-spouses)
        current_spouses = relationships.select do |rel|
          rel[:source] == person.id && 
          rel[:relationship_type] == 'spouse' && 
          !rel[:is_ex]
        end
        stats[:spouses] = current_spouses.count

        # Count ex-spouses
        ex_spouses = relationships.select do |rel|
          rel[:source] == person.id && 
          rel[:relationship_type] == 'spouse' && 
          rel[:is_ex]
        end
        stats[:ex_spouses] = ex_spouses.count

        # Count biological siblings
        biological_siblings = relationships.select do |rel|
          rel[:source] == person.id && rel[:relationship_type] == 'sibling'
        end
        stats[:siblings] = biological_siblings.count

        # Count step-siblings through parents' current/deceased spouses (NOT ex-spouses)
        parents = relationships.select do |rel|
          rel[:source] == person.id && rel[:relationship_type] == 'parent'
        end

        step_siblings_count = 0
        parents.each do |parent_rel|
          parent_id = parent_rel[:target]
          
          # Get parent's current/deceased spouses (exclude ex-spouses)
          parent_spouses = relationships.select do |rel|
            rel[:source] == parent_id && 
            rel[:relationship_type] == 'spouse' && 
            !rel[:is_ex]  # Only current and deceased, not ex
          end
          
          parent_spouses.each do |spouse_rel|
            spouse_id = spouse_rel[:target]
            
            # Find spouse's children who are not person's biological siblings
            spouse_children = relationships.select do |rel|
              rel[:source] == spouse_id && 
              rel[:relationship_type] == 'child' &&
              rel[:target] != person.id  # Skip self
            end
            
            spouse_children.each do |child_rel|
              # Check if this is a biological sibling
              is_biological_sibling = biological_siblings.any? { |sib_rel| sib_rel[:target] == child_rel[:target] }
              step_siblings_count += 1 unless is_biological_sibling
            end
          end
        end
        stats[:step_siblings] = step_siblings_count

        # Count parents
        stats[:parents] = parents.count

        # Count step-parents (parents' spouses who are not biological parents)
        step_parents_count = 0
        parents.each do |parent_rel|
          parent_id = parent_rel[:target]
          
          # Get parent's current/deceased spouses (exclude ex-spouses)
          parent_spouses = relationships.select do |rel|
            rel[:source] == parent_id && 
            rel[:relationship_type] == 'spouse' && 
            !rel[:is_ex]  # Only current and deceased, not ex
          end
          
          parent_spouses.each do |spouse_rel|
            spouse_id = spouse_rel[:target]
            
            # Check if this spouse is also person's biological parent
            is_biological_parent = parents.any? { |par_rel| par_rel[:target] == spouse_id }
            step_parents_count += 1 unless is_biological_parent
          end
        end
        stats[:step_parents] = step_parents_count

        # Calculate total relatives
        stats[:total_relatives] = stats[:children] + stats[:step_children] + 
                                 stats[:spouses] + stats[:siblings] + 
                                 stats[:step_siblings] + stats[:parents] + 
                                 stats[:step_parents]

        stats
      end
    end
  end
end
