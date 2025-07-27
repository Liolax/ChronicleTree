module Api
  module V1
    # Handles profile management for the currently authenticated user.
    class UsersController < BaseController
      def show
        render json: current_user, serializer: Api::V1::UserSerializer
      end

      def update
        if current_user.update(user_update_params)
          render json: current_user, serializer: Api::V1::UserSerializer
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update_password
        if current_user.valid_password?(password_params[:current_password])
          if current_user.update(password_params)
            render json: { message: "Password updated successfully." }, status: :ok
          else
            render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { errors: [ "Current password is incorrect." ] }, status: :unauthorized
        end
      end

      def destroy
        current_user.destroy
        head :no_content
      end

      private

      # Allow modification of name and email
      def user_update_params
        params.require(:user).permit(:name, :email)
      end

      # Require current password for verification
      def password_params
        params.require(:user).permit(:current_password, :password, :password_confirmation)
      end
    end
  end
end
