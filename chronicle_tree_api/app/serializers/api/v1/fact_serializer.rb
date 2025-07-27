# JSON serializer for biographical facts with temporal and geographical context
class Api::V1::FactSerializer < ActiveModel::Serializer
  attributes :id, :label, :value, :date, :location
end
