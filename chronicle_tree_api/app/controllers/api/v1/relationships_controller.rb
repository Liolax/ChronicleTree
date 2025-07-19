# app/controllers/api/v1/relationships_controller.rb
module Api
  module V1
    class RelationshipsController < BaseController
      before_action :set_relationship, only: %i[destroy toggle_ex toggle_deceased]

      # POST /api/v1/relationships
      # body: { relationship: { person_id:, relative_id:, relationship_type: } }
      def create
        @relationship = Relationship.new(relationship_params)

        person = current_user.people.find_by(id: relationship_params[:person_id])
        relative = current_user.people.find_by(id: relationship_params[:relative_id])

        if person && relative
          if @relationship.save
            render json: @relationship,
                   serializer: Api::V1::RelationshipSerializer,
                   status: :created
          else
            render json: { errors: @relationship.errors.full_messages },
                   status: :unprocessable_entity
          end
        else
          render json: { errors: [ "One or both persons not found in your records." ] },
                 status: :not_found
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
