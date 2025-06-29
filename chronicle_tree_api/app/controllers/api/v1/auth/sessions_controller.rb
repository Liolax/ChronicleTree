module Api
  module V1
    module Auth
      class SessionsController < Api::V1::BaseController
        skip_before_action :authenticate_user!, only: [:create]

        # POST /api/v1/auth/sign_in
        def create
          user = User.find_for_database_authentication(email: user_params[:email])
          if user&.valid_password?(user_params[:password])
            token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
            render json: { token: token, user: Api::V1::UserSerializer.new(user).as_json }, status: :ok
          else
            render json: { error: 'Invalid email or password' }, status: :unauthorized
          end
        end

        # DELETE /api/v1/auth/sign_out
        def destroy
          # This is a simplified sign-out. The token is revoked on the client-side.
          # If using a denylist strategy, you would add the token to the denylist here.
          head :no_content
        end

        private

        def user_params
          params.require(:user).permit(:email, :password)
        end
      end
    end
  end
end

