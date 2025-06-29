module Api
  module V1
    class FactsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_person, only: [:index, :create]
      before_action :set_fact, only: [:update, :destroy]

      # GET /api/v1/people/:person_id/facts
      def index
        @facts = @person.facts.order(date: :asc)
        render json: @facts
      end

      # POST /api/v1/people/:person_id/facts
      def create
        @fact = @person.facts.build(fact_params)
        @fact.user = current_user

        if @fact.save
          render json: @fact, status: :created
        else
          render json: @fact.errors, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/facts/:id
      def update
        if @fact.update(fact_params)
          render json: @fact
        else
          render json: @fact.errors, status: :unprocessable_entity
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
        @fact = current_user.facts.find(params[:id])
      end

      def fact_params
        params.require(:fact).permit(:fact_type, :date, :place, :description)
      end
    end
  end
end