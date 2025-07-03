class Api::V1::PersonSerializer < ActiveModel::Serializer
  attributes :id,
             :first_name,
             :last_name,
             :full_name,
             :gender,
             :age,
             :date_of_birth,
             :date_of_death,
             :avatar_url,
             :note

  has_many :facts, key: :key_facts, serializer: Api::V1::FactSerializer
  has_many :timeline_items, key: :timeline_events, serializer: Api::V1::TimelineItemSerializer
  has_many :media, serializer: Api::V1::MediumSerializer
  has_many :relatives, serializer: Api::V1::RelativeSerializer
  has_one :profile, serializer: Api::V1::ProfileSerializer

  def full_name
    "#{object.first_name} #{object.last_name}"
  end

  def age
    return nil unless object.date_of_birth
    today = Date.today
    yrs   = today.year - object.date_of_birth.year
    today < object.date_of_birth + yrs.years ? yrs - 1 : yrs
  end

  def avatar_url
    if object.profile&.respond_to?(:avatar) && object.profile.avatar.respond_to?(:attached?) && object.profile.avatar.attached?
      Rails.application.routes.url_helpers.rails_blob_url(object.profile.avatar, only_path: true)
    else
      nil
    end
  end

  def note
    object.note ? Api::V1::NoteSerializer.new(object.note, scope: scope) : nil
  end
end