require "test_helper"

module Api
  module V1
    module Auth
      class SessionsControllerTest < ActionDispatch::IntegrationTest
        setup do
          @user = users(:default_user)
        end

        test "should log in with valid credentials" do
          post api_v1_user_session_url, params: {
            user: { email: @user.email, password: 'Password123!' }
          }, as: :json
          assert_response :ok
          assert response.parsed_body["token"].present?
        end

        test "should not log in with invalid credentials" do
          post api_v1_user_session_url, params: {
            user: { email: @user.email, password: 'wrongpassword' }
          }, as: :json
          assert_response :unauthorized
        end

        test "should log out" do
          auth_token = sign_in_as(@user)
          delete destroy_api_v1_user_session_url, headers: { 'Authorization' => "Bearer #{auth_token}" }
          assert_response :no_content
        end
      end
    end
  end
end