require "test_helper"

module Api
  module V1
    class UsersControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user = users(:default_user)
        @auth_token = sign_in_as(@user)
        @headers = { 'Authorization' => "Bearer #{@auth_token}" }
      end

      test "should show current user's profile" do
        get api_v1_users_me_url, headers: @headers, as: :json
        assert_response :success
        body = JSON.parse(response.body)
        assert_equal @user.email, body["email"]
      end

      test "should update user's name and email" do
        patch api_v1_users_me_url, params: { user: { name: "Updated", email: "updated@example.com" } }, headers: @headers, as: :json
        assert_response :success
        body = JSON.parse(response.body)
        assert_equal "Updated", body["name"]
        assert_equal "updated@example.com", body["email"]
      end

      test "should update user's password" do
        patch api_v1_users_password_url, params: {
          user: {
            current_password: "Password123!",
            password: "NewStrongPassword1!",
            password_confirmation: "NewStrongPassword1!"
          }
        }, headers: @headers, as: :json
        assert_response :success
      end

      test "should destroy user account" do
        assert_difference('User.count', -1) do
          delete api_v1_users_me_url, headers: @headers, as: :json
        end
        assert_response :no_content
      end

      test "should not show profile when unauthorized" do
        get api_v1_users_me_url, as: :json
        assert_response :unauthorized
      end

      test "should not update with invalid data" do
        patch api_v1_users_me_url, params: { user: { email: "" } }, headers: @headers, as: :json
        assert_response :unprocessable_entity
      end
    end
  end
end