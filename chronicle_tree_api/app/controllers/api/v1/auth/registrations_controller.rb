module Api
  module V1
    module Auth
      class RegistrationsController < Api::V1::BaseController
        skip_before_action :authenticate_user!, only: [:create]

        def create
          user = User.new(sign_up_params)
          if user.save
            token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
            render json: { token: token, user: Api::V1::UserSerializer.new(user).as_json }, status: :created
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def sign_up_params
          params.require(:user).permit(:name, :email, :password, :password_confirmation)
        end
      end
    end
  end
end
end
    end
  end
end
end
