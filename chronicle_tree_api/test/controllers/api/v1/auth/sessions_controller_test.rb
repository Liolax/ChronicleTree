require "test_helper"

class Api::V1::Auth::SessionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:default_user)
  end

  test "should get token on sign in with valid credentials" do
    post api_v1_auth_sign_in_url,
         params: { user: { email: @user.email, password: 'Password123!' } },
         as: :json

    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_not_nil json_response['token']
    assert_not_nil json_response['user']
  end

  test "should not get token on sign in with invalid password" do
    post api_v1_auth_sign_in_url,
         params: { user: { email: @user.email, password: 'wrong_password' } },
         as: :json

    assert_response :unauthorized
  end

  test "should sign out successfully" do
    headers = { 'Authorization' => sign_in_as(@user) }
    delete api_v1_auth_sign_out_url, headers: headers, as: :json

    assert_response :no_content
  end
end
