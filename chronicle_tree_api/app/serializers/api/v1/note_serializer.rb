# app/serializers/api/v1/note_serializer.rb
class Api::V1::NoteSerializer < ActiveModel::Serializer
  attributes :id, :content, :created_at, :updated_at
end
