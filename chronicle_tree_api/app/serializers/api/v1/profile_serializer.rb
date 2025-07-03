class Api::V1::ProfileSerializer < ActiveModel::Serializer
  attributes :id, :person_id
end
