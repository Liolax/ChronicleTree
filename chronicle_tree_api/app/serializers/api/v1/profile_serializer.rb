# JSON serializer for user profile data with person association
class Api::V1::ProfileSerializer < ActiveModel::Serializer
  attributes :id, :person_id
end
