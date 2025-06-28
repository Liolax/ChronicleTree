# app/controllers/api/v1/relationships_controller.rb
module Api
  module V1
    class RelationshipsController < BaseController
      before_action :set_person, only: %i[create]
      before_action :set_relationship, only: %i[destroy]

      # POST /api/v1/relationships
      # body: { relationship: { person_id:, friend_id:, relationship_type: } }
      def create
        rel = @person.relationships.build(relationship_params)
        if rel.save
          render json: rel,
                 serializer: Api::V1::RelationshipSerializer,
                 status: :created
        else
          render json: { errors: rel.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/relationships/:id
      def destroy
        @relationship.destroy
        head :no_content
      end

      private

      def set_person
        @person = current_user.people.find(relationship_params[:person_id])
      end

      def set_relationship
        @relationship = current_user.people
                                    .flat_map(&:relationships)
                                    .find { |r| r.id == params[:id].to_i }
        head :not_found unless @relationship
      end

      def relationship_params
        params.require(:relationship)
              .permit(:person_id, :friend_id, :relationship_type)
      end
    end
  end
end
