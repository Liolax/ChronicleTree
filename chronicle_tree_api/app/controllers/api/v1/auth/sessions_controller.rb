module Api
  module V1
    module Auth
      class SessionsController < Devise::SessionsController
        respond_to :json

        # POST /api/v1/auth/sign_in
        def create
          super do |user|
            token = request.env['warden-jwt_auth.token']
            render json: { token: token, user: user }, status: :ok and return
          end
        end

        private
        def respond_to_on_destroy
          head :no_content
        end
      end
    end
  end
end
