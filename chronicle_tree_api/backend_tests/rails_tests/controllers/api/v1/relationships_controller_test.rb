require "test_helper"

module Api
  module V1
    class RelationshipsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user = users(:one)
        @person = people(:one)
        @relative = people(:two)
        @other_user_person = people(:three) # Belongs to users(:two)
        @relationship = relationships(:one)
        sign_in @user
      end

      test "should create relationship for own people" do
        assert_difference("Relationship.count") do
          post api_v1_relationships_url, params: {
            relationship: {
              person_id: @person.id,
              relative_id: @relative.id,
              relationship_type: "spouse"
            }
          }, as: :json
        end
        assert_response :created
      end

      test "should not create relationship for other user's person" do
        assert_no_difference("Relationship.count") do
          post api_v1_relationships_url, params: {
            relationship: {
              person_id: @person.id,
              relative_id: @other_user_person.id,
              relationship_type: "friend"
            }
          }, as: :json
        end
        assert_response :not_found
      end

      test "should destroy relationship" do
        assert_difference("Relationship.count", -1) do
          delete api_v1_relationship_url(@relationship), as: :json
        end
        assert_response :no_content
      end

      test "should not destroy other user's relationship" do
        other_relationship = relationships(:three) # Belongs to users(:two)
        assert_no_difference("Relationship.count") do
          delete api_v1_relationship_url(other_relationship), as: :json
        end
        assert_response :forbidden
      end
    end
  end
end
