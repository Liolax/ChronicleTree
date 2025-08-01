module Api
  module V1
    class FactsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_person, only: [ :index, :create ]
      before_action :set_fact, only: [ :update, :destroy ]

      def index
        @facts = @person.facts.order(date: :asc)
        render json: @facts
      end

      def create
        @fact = @person.facts.build(fact_params)
        if @fact.save
          render json: @fact, status: :created
        else
          render json: @fact.errors, status: :unprocessable_entity
        end
      end

      def update
        if @fact.update(fact_params)
          render json: @fact
        else
          render json: @fact.errors, status: :unprocessable_entity
        end
      end

      def destroy
        @fact.destroy
        head :no_content
      end

      private

      def set_person
        @person = current_user.people.find(params[:person_id])
      end

      def set_fact
        @fact = Fact.find(params[:id])
        unless @fact.person.user_id == current_user.id
          head :forbidden
        end
      end

      def fact_params
        params.require(:fact).permit(:label, :value, :date, :location)
      end
    end
  end
end
