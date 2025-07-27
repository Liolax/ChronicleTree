# JSON serializer for chronological life events with descriptive metadata
class Api::V1::TimelineItemSerializer < ActiveModel::Serializer
  attributes :id, :title, :date, :place, :icon, :description
end
