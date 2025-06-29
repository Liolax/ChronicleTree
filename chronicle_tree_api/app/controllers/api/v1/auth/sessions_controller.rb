module Api
  module V1
    module Auth
      # Handles user login (sign-in) and logout (sign-out) for API clients.
      class SessionsController < Devise::SessionsController
        # This controller inherits from Devise and is configured to respond to JSON.
        # The devise-jwt gem hooks into the create/destroy actions to dispatch/revoke tokens.
        # No custom implementation is needed for standard sign-in/sign-out.

        private

        def respond_with(resource, _opts = {})
          render json: {
            status: { code: 200, message: 'Logged in successfully.' },
            data: Api::V1::UserSerializer.new(resource).as_json
          }, status: :ok
        end

        def respond_to_on_destroy
          head :no_content
        end
      end
    end
  end
end