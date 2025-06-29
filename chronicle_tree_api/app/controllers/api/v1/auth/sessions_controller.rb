module Api
  module V1
    module Auth
      class SessionsController < Devise::SessionsController
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          # resource is the user instance
          token = Warden::JWTAuth::UserEncoder.new.call(resource, :user, nil).first
          render json: {
            status: { code: 200, message: 'Logged in successfully.' },
            data: { token: token, user: Api::V1::UserSerializer.new(resource).as_json }
          }, status: :ok
        end

        def respond_to_on_destroy
          if current_user
            render json: {
              status: 200,
              message: "logged out successfully"
            }, status: :ok
          else
            render json: {
              status: 401,
              message: "Couldn't find an active session."
            }, status: :unauthorized
          end
        end
      end
    end
  end
end

