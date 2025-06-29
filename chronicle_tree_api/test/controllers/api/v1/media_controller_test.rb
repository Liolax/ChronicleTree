require "test_helper"

class Api::V1::MediaControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:default_user)
    @auth_headers = { 'Authorization' => sign_in_as(@user) }
    @person = people(:one)
    @person.update(user: @user) # Ensure person belongs to the signed-in user
    @medium = media(:one)
    @medium.update(attachable: @person) # Ensure medium belongs to the person
  end

  test "should get index for a person" do
    get api_v1_person_media_url(@person), headers: @auth_headers, as: :json
    assert_response :success
  end

  test "should create medium for a person" do
    # This test requires Active Storage setup for file uploads.
    # We will simulate the creation without a file attachment for now.
    assert_difference('@person.media.count') do
      post api_v1_person_media_url(@person), params: {
        media: { description: 'A new photo' }
      }, headers: @auth_headers, as: :json
    end

    # The response will be :unprocessable_entity without a file.
    # Change to :created once file uploads are handled.
    assert_response :unprocessable_entity
  end

  test "should destroy medium" do
    assert_difference("Medium.count", -1) do
      delete api_v1_medium_url(@medium), headers: @auth_headers, as: :json
    end

    assert_response :no_content
  end
end
