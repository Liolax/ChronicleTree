module Api
  module V1
    module Auth
      # Handles user registration for API clients.
      class RegistrationsController < Devise::RegistrationsController
        # Inherits from Devise, customizes response format for API.
        def create
          build_resource(sign_up_params)

          resource.save
          if resource.persisted?
            # devise-jwt will dispatch a token on successful registration
            render json: {
              status: { code: 200, message: "Signed up successfully." },
              data: Api::V1::UserSerializer.new(resource).as_json
            }
          else
            render json: {
              status: { message: "User couldn't be created successfully. #{resource.errors.full_messages.to_sentence}" }
            }, status: :unprocessable_entity
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
