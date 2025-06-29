# app/serializers/api/v1/relative_serializer.rb
# This serializer provides a minimal representation of a person to avoid
# circular dependencies when serializing relatives.
class Api::V1::RelativeSerializer < ActiveModel::Serializer
  attributes :id, :full_name, :relationship_type

  def full_name
    "#{object.first_name} #{object.last_name}"
  end

  # The 'relationship_type' is not on the Person model itself.
  # It's available on the `object` because it's added by the query
  # in the PeopleController#relatives action.
  def relationship_type
    object.try(:relationship_type)
  end
end
end
