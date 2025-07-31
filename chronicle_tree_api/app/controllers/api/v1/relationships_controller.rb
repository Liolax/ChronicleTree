# Controller for managing family relationships
# Handles relationship creation and modification
module Api
  module V1
    class RelationshipsController < BaseController
      before_action :set_relationship, only: %i[destroy toggle_ex toggle_deceased]

      def create
        person = current_user.people.find_by(id: relationship_params[:person_id])
        relative = current_user.people.find_by(id: relationship_params[:relative_id])

        unless person && relative
          render json: { errors: [ "One or both persons not found in your records." ] },
                 status: :not_found
          return
        end

        # Comprehensive validation based on relationship type and genealogical rules
        case relationship_params[:relationship_type]
        when 'spouse'
          # Check if either person already has a current spouse
          if person.current_spouses.any?
            current_spouse_names = person.current_spouses.map(&:full_name).join(', ')
            render json: { 
              errors: ["#{person.full_name} already has a current spouse (#{current_spouse_names}). A person can only have one current spouse at a time. If you want to add #{relative.full_name} as a spouse, you'll need to mark the existing marriage as ended first."]
            }, status: :unprocessable_entity
            return
          end
          
          if relative.current_spouses.any?
            current_spouse_names = relative.current_spouses.map(&:full_name).join(', ')
            render json: { 
              errors: ["#{relative.full_name} already has a current spouse (#{current_spouse_names}). A person can only have one current spouse at a time. If you want to add #{person.full_name} as a spouse, you'll need to mark the existing marriage as ended first."]
            }, status: :unprocessable_entity
            return
          end
          
          # Consanguinity validation to prevent inappropriate marriages
          unless BloodRelationshipDetector.marriage_allowed?(person, relative)
            blood_relationship = BloodRelationshipDetector.new(person, relative).relationship_description
            render json: { 
              errors: [ "Cannot marry blood relative#{blood_relationship ? " (#{blood_relationship})" : ''} - incestuous relationships are prohibited" ] 
            }, status: :unprocessable_entity
            return
          end
        when 'sibling'
          # Sibling relationship validation with biological and legal constraints
          unless BloodRelationshipDetector.sibling_allowed?(person, relative)
            blood_relationship = BloodRelationshipDetector.new(person, relative).relationship_description
            error_msg = if blood_relationship
              "Cannot add sibling relationship - #{blood_relationship.downcase} relationship already exists"
            else
              "Cannot add sibling relationship - age gap too large, timeline conflict, or inappropriate relationship"
            end
            render json: { 
              errors: [ error_msg ] 
            }, status: :unprocessable_entity
            return
          end
          
          # Validates that potential siblings don't share children (indicating past romantic relationship)
          person_children = person.children.pluck(:id)
          relative_children = relative.children.pluck(:id)
          shared_children = person_children & relative_children
          
          if shared_children.any?
            shared_child_names = Person.where(id: shared_children).pluck(:first_name, :last_name).map { |f, l| "#{f} #{l}" }
            render json: { 
              errors: [ "Cannot add sibling relationship - #{person.first_name} #{person.last_name} and #{relative.first_name} #{relative.last_name} share children (#{shared_child_names.join(', ')}), indicating a past romantic relationship" ] 
            }, status: :unprocessable_entity
            return
          end
          
          # Ensures sibling relationships have proper biological or step-family basis
          person_parents = person.parents.pluck(:id).sort
          relative_parents = relative.parents.pluck(:id).sort
          
          # Only block if both people have 2 complete different blood parents
          if person_parents.count == 2 && relative_parents.count == 2
            # Check if they share any parents (full or half siblings)
            shared_parents = person_parents & relative_parents
            has_shared_biological_parent = shared_parents.any?
            has_step_relationship = false
            
            unless has_shared_biological_parent
              # Check for step-sibling relationship
              person.parents.each do |person_parent|
                relative.parents.each do |relative_parent|
                  if person_parent.spouses.include?(relative_parent)
                    has_step_relationship = true
                    break
                  end
                end
                break if has_step_relationship
              end
              
              unless has_step_relationship
                render json: { 
                  errors: [ "Cannot add sibling relationship - people with 2 complete different blood parents cannot be siblings unless their parents are married to each other" ] 
                }, status: :unprocessable_entity
                return
              end
            end
          end
          
          # Age difference validation for realistic sibling relationships
          if person.date_of_birth && relative.date_of_birth
            age_gap = ((person.date_of_birth - relative.date_of_birth).abs / 365.25).round(1)
            if age_gap > 25
              render json: { 
                errors: [ "Age gap too large (#{age_gap} years) for sibling relationship" ] 
              }, status: :unprocessable_entity
              return
            end
          end
        end

        @relationship = Relationship.new(relationship_params)
        if @relationship.save
          render json: @relationship,
                 serializer: Api::V1::RelationshipSerializer,
                 status: :created
        else
          render json: { errors: @relationship.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      def destroy
        if @relationship.person.user == current_user
          @relationship.destroy
          head :no_content
        else
          head :forbidden
        end
      end

      def toggle_ex
        if @relationship.relationship_type == "spouse"
          @relationship.is_ex = !@relationship.is_ex
          if @relationship.save
            render json: { success: true, is_ex: @relationship.is_ex }
          else
            render json: { success: false, errors: @relationship.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { success: false, error: "Only spouse relationships can be toggled." }, status: :bad_request
        end
      end

      def toggle_deceased
        if @relationship.relationship_type == "spouse"
          @relationship.is_deceased = !@relationship.is_deceased
          if @relationship.save
            render json: { success: true, is_deceased: @relationship.is_deceased }
          else
            render json: { success: false, errors: @relationship.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { success: false, error: "Only spouse relationships can be marked as deceased." }, status: :bad_request
        end
      end

      private

      def set_relationship
        @relationship = Relationship.find_by(id: params[:id])
        head :not_found unless @relationship
      end

      def relationship_params
        params.require(:relationship)
              .permit(:person_id, :relative_id, :relationship_type, :is_ex, :is_deceased, :shared_parent_id)
      end
    end
  end
end
