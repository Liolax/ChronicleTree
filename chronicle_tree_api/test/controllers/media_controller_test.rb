require "test_helper"

class MediaControllerTest < ActionDispatch::IntegrationTest
  setup do
    @medium = media(:one)
  end

  test "should get index" do
    get media_url, as: :json
    assert_response :success
  end

  test "should create medium" do
    assert_difference("Medium.count") do
      post media_url, params: { medium: { attachable_id: @medium.attachable_id, attachable_type: @medium.attachable_type, description: @medium.description } }, as: :json
    end

    assert_response :created
  end

  test "should show medium" do
    get medium_url(@medium), as: :json
    assert_response :success
  end

  test "should update medium" do
    patch medium_url(@medium), params: { medium: { attachable_id: @medium.attachable_id, attachable_type: @medium.attachable_type, description: @medium.description } }, as: :json
    assert_response :success
  end

  test "should destroy medium" do
    assert_difference("Medium.count", -1) do
      delete medium_url(@medium), as: :json
    end

    assert_response :no_content
  end
end
