module Api
  module V1
    module Auth
      # JWT-based authentication controller for user session management
      # Extends Devise sessions with JSON API responses and token handling
      class SessionsController < Devise::SessionsController
        respond_to :json

        private

        def respond_to_on_destroy
          head :no_content
        end
      end
    end
  end
end
