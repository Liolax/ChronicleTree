require "test_helper"

module Api
  module V1
    class MediaControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user = users(:one)
        @person = people(:one)
        @file = fixture_file_upload('test.png', 'image/png')
        sign_in @user
      end

      test "should get index" do
        get api_v1_person_media_url(@person), as: :json
        assert_response :success
      end

      test "should create media" do
        assert_difference('@person.media.count') do
          post api_v1_person_media_url(@person), params: { media: { description: 'A test file', file: @file } }
        end
        assert_response :created
      end

      test "should destroy media" do
        media = media(:one)
        assert_difference('Medium.count', -1) do
          delete api_v1_medium_url(media)
        end
        assert_response :no_content
      end
    end
  end
end
