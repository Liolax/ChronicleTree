# app/serializers/api/v1/person_serializer.rb
class Api::V1::PersonSerializer < ActiveModel::Serializer
  attributes :id,
             :first_name,
             :last_name,
             :full_name,
             :age,
             :gender,
             :date_of_birth,
             :date_of_death,
             :avatar_url

  has_many :facts,         key: :key_facts,      serializer: Api::V1::FactSerializer
  has_many :timeline_items, key: :timeline,      serializer: Api::V1::TimelineItemSerializer
  has_many :media,         serializer: Api::V1::MediumSerializer
  has_many :friends        # gives a flat list of related Person objects

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
    return unless object.profile&.avatar&.attached?
    Rails.application.routes.url_helpers.rails_blob_url(object.profile.avatar, only_path: true)
  end
end
