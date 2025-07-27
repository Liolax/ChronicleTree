# JSON serializer for textual annotations with timestamp metadata
class Api::V1::NoteSerializer < ActiveModel::Serializer
  attributes :id, :content, :created_at, :updated_at
end
