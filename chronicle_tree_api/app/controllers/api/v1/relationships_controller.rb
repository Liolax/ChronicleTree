# app/controllers/api/v1/relationships_controller.rb
module Api
  module V1
    class RelationshipsController < BaseController
      before_action :set_relationship, only: %i[destroy toggle_ex toggle_deceased]

      # POST /api/v1/relationships
      # body: { relationship: { person_id:, relative_id:, relationship_type: } }
      def create
        person = current_user.people.find_by(id: relationship_params[:person_id])
        relative = current_user.people.find_by(id: relationship_params[:relative_id])

        unless person && relative
          render json: { errors: [ "One or both persons not found in your records." ] },
                 status: :not_found
          return
        end

        # ✅ ENHANCED RELATIONSHIP VALIDATION
        case relationship_params[:relationship_type]
        when 'spouse'
          # Use enhanced blood relationship detector that supports complex remarriage scenarios
          unless BloodRelationshipDetector.marriage_allowed?(person, relative)
            blood_relationship = BloodRelationshipDetector.new(person, relative).relationship_description
            render json: { 
              errors: [ "Cannot marry blood relative#{blood_relationship ? " (#{blood_relationship})" : ''} - incestuous relationships are prohibited" ] 
            }, status: :unprocessable_entity
            return
          end
        when 'sibling'
          # Use enhanced sibling relationship detector
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
          
          # CRITICAL: Validate that siblings share at least one parent
          # This is the most important validation for biological siblings
          person_parents = person.parents.pluck(:id).sort
          relative_parents = relative.parents.pluck(:id).sort
          
          # Check if they share any parents
          shared_parents = person_parents & relative_parents
          
          # For biological siblings, they must share at least one parent
          # For step-siblings, one person's parent must be married to the other person's parent
          has_shared_biological_parent = shared_parents.any?
          has_step_relationship = false
          
          unless has_shared_biological_parent
            # Check for step-sibling relationship
            person.parents.each do |person_parent|
              relative.parents.each do |relative_parent|
                # Check if person's parent is married to relative's parent
                if person_parent.spouses.include?(relative_parent)
                  has_step_relationship = true
                  break
                end
              end
              break if has_step_relationship
            end
            
            unless has_step_relationship
              render json: { 
                errors: [ "Cannot add sibling relationship - siblings must share at least one parent or have parents married to each other" ] 
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

      # DELETE /api/v1/relationships/:id
      def destroy
        if @relationship.person.user == current_user
          @relationship.destroy
          head :no_content
        else
          head :forbidden
        end
      end

      # PATCH /api/v1/relationships/:id/toggle_ex
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

      # PATCH /api/v1/relationships/:id/toggle_deceased
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
              .permit(:person_id, :relative_id, :relationship_type, :is_ex, :is_deceased)
      end
    end
  end
end
