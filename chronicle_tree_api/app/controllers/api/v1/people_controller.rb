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
        person = current_user.people.build(person_params)
        if person.save
          Rails.logger.info "[PeopleController#create] Person created: \n#{person.inspect}"
          render json: person, serializer: Api::V1::PersonSerializer, status: :created
        else
          Rails.logger.error "[PeopleController#create] Failed to create person: \n#{person.errors.full_messages}"
          render json: { errors: person.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/people/:id
      def update
        if @person.update(person_params)
          render json: @person, serializer: Api::V1::PersonSerializer, status: :ok
        else
          render json: { errors: @person.errors.full_messages }, status: :unprocessable_entity
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
        people = current_user.people
        nodes = people.to_a
        edges = []
        people.each do |person|
          person.relationships.each do |rel|
            # Only include edges where both people are in the user's tree
            if people.map(&:id).include?(rel.relative_id)
              edges << {
                from: person.id,
                to: rel.relative_id,
                type: rel.relationship_type
              }
            end
          end
        end
        render json: {
          nodes: ActiveModelSerializers::SerializableResource.new(nodes, each_serializer: Api::V1::PersonSerializer),
          edges: edges
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
          :gender
        )
      end
    end
  end
end
