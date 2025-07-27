# JSON serializer for user account data with privacy-conscious field selection
# Excludes sensitive authentication information from API responses
class Api::V1::UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :name, :created_at, :updated_at
end
