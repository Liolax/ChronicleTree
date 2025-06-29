require "test_helper"

class PeopleControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:default_user)
    @auth_headers = { 'Authorization' => sign_in_as(@user) }
    @person = people(:one)
    @person.update(user: @user) # Ensure person belongs to the signed-in user
  end

  test "should get index" do
    get api_v1_people_url, headers: @auth_headers, as: :json
    assert_response :success
  end

  test "should create person" do
    assert_difference("Person.count") do
      post api_v1_people_url, params: { person: { first_name: 'New', last_name: 'Person' } }, headers: @auth_headers, as: :json
    end

    assert_response :created
  end

  test "should show person" do
    get api_v1_person_url(@person), headers: @auth_headers, as: :json
    assert_response :success
  end

  test "should update person" do
    patch api_v1_person_url(@person), params: { person: { first_name: 'Updated' } }, headers: @auth_headers, as: :json
    assert_response :success
  end

  test "should destroy person" do
    assert_difference("Person.count", -1) do
      delete api_v1_person_url(@person), headers: @auth_headers, as: :json
    end

    assert_response :no_content
  end
end
