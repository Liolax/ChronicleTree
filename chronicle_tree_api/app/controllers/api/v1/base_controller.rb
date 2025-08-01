# Base controller providing shared functionality for all API v1 endpoints
# Handles authentication and common error responses
module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate_user!

      rescue_from ActiveRecord::RecordNotFound, with: :not_found

      private

      def not_found
        render json: { error: "Resource not found" }, status: :not_found
      end
    end
  end
end
