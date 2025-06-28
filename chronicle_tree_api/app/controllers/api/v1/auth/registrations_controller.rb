module Api
  module V1
    module Auth
      class RegistrationsController < Devise::RegistrationsController
        respond_to :json

        def create
          build_resource(sign_up_params)

          if resource.save
            # Instead of relying on Devise's sign_in, which doesn't issue a JWT
            # on its own in this context, we'll manually create the token.
            warden.set_user(resource, scope: :user)
            token = Warden::JWTAuth::UserEncoder.new.call(resource, :user, nil).first
            
            render json: { token: token, user: Api::V1::UserSerializer.new(resource).as_json }, status: :created
          else
            render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
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
