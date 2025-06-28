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
        person = current_user.people.build(person_params)
        if person.save
          render json: person, serializer: Api::V1::PersonSerializer, status: :created
        else
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
        render json: { nodes: nodes, edges: edges }, status: :ok
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
