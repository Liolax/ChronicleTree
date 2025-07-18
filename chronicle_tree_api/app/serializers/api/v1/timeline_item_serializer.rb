# app/serializers/api/v1/timeline_item_serializer.rb
class Api::V1::TimelineItemSerializer < ActiveModel::Serializer
  attributes :id, :title, :date, :place, :icon, :description
end
