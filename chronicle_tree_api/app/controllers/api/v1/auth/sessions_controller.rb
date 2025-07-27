module Api
  module V1
    module Auth
      # Handles user login and logout for API clients.
      class SessionsController < Devise::SessionsController
        respond_to :json
        # Inherits from Devise, configured for JSON responses.
        # The devise-jwt gem handles token dispatch/revoke.

        private

        def respond_to_on_destroy
          head :no_content
        end
      end
    end
  end
end
