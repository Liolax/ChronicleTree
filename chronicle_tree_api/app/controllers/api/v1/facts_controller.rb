module Api
  module V1
    class FactsController < BaseController
      before_action :set_person, only: %i[index create]
      before_action :set_fact,   only: %i[update destroy]

      # GET /api/v1/people/:person_id/facts
      def index
        render json: @person.facts,
               each_serializer: Api::V1::FactSerializer,
               status: :ok
      end

      # POST /api/v1/people/:person_id/facts
      def create
        fact = @person.facts.build(fact_params)
        if fact.save
          render json: fact,
                 serializer: Api::V1::FactSerializer,
                 status: :created
        else
          render json: { errors: fact.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/facts/:id
      def update
        if @fact.update(fact_params)
          render json: @fact, serializer: Api::V1::FactSerializer, status: :ok
        else
          render json: { errors: @fact.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/facts/:id
      def destroy
        @fact.destroy
        head :no_content
      end

      private

      def set_person
        @person = current_user.people.find(params[:person_id])
      end

      def set_fact
        @fact = current_user.people
                            .flat_map(&:facts)
                            .find { |f| f.id == params[:id].to_i }
        unless @fact
          head :not_found
          return
        end
      end

      def fact_params
        params.require(:fact).permit(:label, :value, :date, :location)
      end
    end
  end
end