# app/controllers/api/v1/relationships_controller.rb
module Api
  module V1
    class RelationshipsController < BaseController
      before_action :set_relationship, only: %i[destroy]

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
          render json: { errors: ["One or both persons not found in your records."] },
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

      private

      def set_relationship
        @relationship = Relationship.find_by(id: params[:id])
        head :not_found unless @relationship
      end

      def relationship_params
        params.require(:relationship)
              .permit(:person_id, :relative_id, :relationship_type)
      end
    end
  end
end
