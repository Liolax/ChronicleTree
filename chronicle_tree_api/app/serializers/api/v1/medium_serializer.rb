# app/serializers/api/v1/medium_serializer.rb
class Api::V1::MediumSerializer < ActiveModel::Serializer
  attributes :id, :file_url, :description

  # rails_blob_url requires including the URL helper
  include Rails.application.routes.url_helpers

  def file_url
    rails_blob_url(object.file, only_path: true)
  end
end
