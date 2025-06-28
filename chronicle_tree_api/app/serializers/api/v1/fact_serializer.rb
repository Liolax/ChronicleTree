# app/serializers/api/v1/fact_serializer.rb
class Api::V1::FactSerializer < ActiveModel::Serializer
  attributes :id, :label, :value, :date, :location
end
