# Serializes User data for API responses.
# Exposes only non-sensitive fields.
class Api::V1::UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :name, :created_at, :updated_at
end