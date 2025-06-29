require "test_helper"

module Api
  module V1
    module Auth
      class RegistrationsControllerTest < ActionDispatch::IntegrationTest
        test "should register user with valid data" do
          assert_difference('User.count') do
            post api_v1_user_registration_url, params: {
              user: {
                name: 'New User',
                email: 'new@example.com',
                password: 'Password123!',
                password_confirmation: 'Password123!'
              }
            }, as: :json
          end
          assert_response :created
          assert JSON.parse(response.body)["token"].present?
        end

        test "should not register user with invalid data" do
          assert_no_difference('User.count') do
            post api_v1_user_registration_url, params: {
              user: {
                name: 'New User',
                email: 'new@example.com',
                password: 'short',
                password_confirmation: 'short'
              }
            }, as: :json
          end
          assert_response :unprocessable_entity
          assert JSON.parse(response.body)["errors"].present?
        end
      end
    end
  end
end