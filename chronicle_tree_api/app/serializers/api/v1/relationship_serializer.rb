# app/serializers/api/v1/relationship_serializer.rb
class Api::V1::RelationshipSerializer < ActiveModel::Serializer
  attributes :id, :person_id, :relative_id, :relationship_type, :is_ex, :is_deceased
end
