module Api
  module V1
    # UsersController handles profile management for the currently authenticated user.
    # All actions are strictly scoped to current_user, ensuring privacy and data isolation.
    class UsersController < BaseController
      # GET /api/v1/users/me
      # Returns the authenticated user's profile.
      def show
        render json: current_user, serializer: Api::V1::UserSerializer
      end

      # PATCH/PUT /api/v1/users/me
      # Allows updating the user's name and email address.
      def update
        if current_user.update(user_update_params)
          render json: current_user, serializer: Api::V1::UserSerializer
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/users/me/password
      # Enables a user to securely change their password.
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

      # DELETE /api/v1/users/me
      # Deletes the authenticated user's account.
      def destroy
        current_user.destroy
        head :no_content
      end

      private

      # Only allow modification of name and email.
      def user_update_params
        params.require(:user).permit(:name, :email)
      end

      # Require current password for verification before updating.
      def password_params
        params.require(:user).permit(:current_password, :password, :password_confirmation)
      end
    end
  end
end
