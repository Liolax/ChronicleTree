# JSON serializer providing minimal person representation to prevent circular dependencies
# Used for serializing family relatives without full person object complexity
class Api::V1::RelativeSerializer < ActiveModel::Serializer
  attributes :id, :full_name, :relationship_type

  def full_name
    "#{object.first_name} #{object.last_name}"
  end

  # Relationship type comes from query-added attribute in PeopleController#relatives action
  # Not part of base Person model but dynamically included for relative connections
  def relationship_type
    object.try(:relationship_type)
  end
end
