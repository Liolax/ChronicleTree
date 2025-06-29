require "test_helper"

class Api::V1::RelationshipsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:default_user)
    @auth_headers = { 'Authorization' => sign_in_as(@user) }
    @person1 = people(:one)
    @person2 = people(:two)
    @person1.update(user: @user)
    @person2.update(user: @user)
    @relationship = relationships(:one)
    @relationship.update(person: @person1, relative: @person2)
  end

  test "should create relationship" do
    person3 = Person.create(first_name: "New", last_name: "Person", user: @user)
    assert_difference("Relationship.count") do
      post api_v1_relationships_url, params: {
        relationship: {
          person_id: @person1.id,
          relative_id: person3.id,
          relationship_type: 'friend'
        }
      }, headers: @auth_headers, as: :json
    end

    assert_response :created
  end

  test "should destroy relationship" do
    assert_difference("Relationship.count", -1) do
      delete api_v1_relationship_url(@relationship), headers: @auth_headers, as: :json
    end

    assert_response :no_content
  end

  test "should not create relationship for person not owned by user" do
    other_user = User.create(name: "Other", email: "other@test.com", password: "password")
    other_person = Person.create(first_name: "Other", last_name: "Person", user: other_user)

    assert_no_difference("Relationship.count") do
      post api_v1_relationships_url, params: {
        relationship: {
          person_id: @person1.id,
          relative_id: other_person.id,
          relationship_type: 'friend'
        }
      }, headers: @auth_headers, as: :json
    end

    assert_response :not_found
  end
end
