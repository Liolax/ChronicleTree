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
             :note,
             :relatives,
             :parents_in_law,
             :children_in_law,
             :siblings_in_law

  has_many :facts, key: :key_facts, serializer: Api::V1::FactSerializer
  has_many :timeline_items, key: :timeline_events, serializer: Api::V1::TimelineItemSerializer
  has_many :media, serializer: Api::V1::MediumSerializer
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

  # Custom relatives array with relationship_type
  def relatives
    object.relationships.includes(:relative).map do |rel|
      rel.relative.as_json(only: [:id, :first_name, :last_name]).merge({
        full_name: "#{rel.relative.first_name} #{rel.relative.last_name}",
        relationship_type: rel.relationship_type,
        id: rel.relative.id
      })
    end
  end

  def parents_in_law
    object.parents_in_law.map do |p|
      p.as_json(only: [:id, :first_name, :last_name]).merge({
        full_name: "#{p.first_name} #{p.last_name}",
        id: p.id
      })
    end
  end

  def children_in_law
    object.children_in_law.map do |c|
      c.as_json(only: [:id, :first_name, :last_name]).merge({
        full_name: "#{c.first_name} #{c.last_name}",
        id: c.id
      })
    end
  end

  def siblings_in_law
    object.siblings_in_law.map do |s|
      s.as_json(only: [:id, :first_name, :last_name]).merge({
        full_name: "#{s.first_name} #{s.last_name}",
        id: s.id
      })
    end
  end

  def media
    object.media.select { |m| m.file.attached? }
  end
end