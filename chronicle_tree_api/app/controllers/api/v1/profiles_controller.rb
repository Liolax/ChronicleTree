module Api
  module V1
    class ProfilesController < ApplicationController
      before_action :set_profile, only: %i[ show update destroy ]

      def index
        @profiles = Profile.all

        render json: @profiles
      end

      def show
        render json: @profile
      end

      def create
        @profile = Profile.new(profile_params)

        if @profile.save
          render json: @profile, status: :created, location: @profile
        else
          render json: @profile.errors, status: :unprocessable_entity
        end
      end

      def update
        if @profile.update(profile_params)
          render json: @profile
        else
          render json: @profile.errors, status: :unprocessable_entity
        end
      end

      def destroy
        @profile.destroy!
      end

      private
        def set_profile
          @profile = Profile.find(params[:id])
        end

        def profile_params
          params.require(:profile).permit(:person_id, :notes, :avatar)
        end
    end
  end
end
