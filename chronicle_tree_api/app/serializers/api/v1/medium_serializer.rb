# JSON serializer for media attachments with file metadata and URL generation
class Api::V1::MediumSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  attributes :id, :title, :description, :created_at, :updated_at, :url, :filename, :content_type, :byte_size

  def url
    if object.file.attached?
      rails_blob_url(object.file, only_path: true)
    else
      nil
    end
  end

  def filename
    object.file.filename.to_s if object.file.attached?
  end

  def content_type
    object.file.content_type if object.file.attached?
  end

  def byte_size
    object.file.byte_size if object.file.attached?
  end
end
