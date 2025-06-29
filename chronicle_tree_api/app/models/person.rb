# app/models/person.rb
class Person < ApplicationRecord
  belongs_to :user

  has_many :relationships,
           class_name: 'Relationship',
           foreign_key: 'person_id',
           inverse_of: :person,
           dependent: :destroy

  has_many :related_by_relationships,
           class_name: 'Relationship',
           foreign_key: 'relative_id',
           inverse_of: :relative,
           dependent: :destroy

  has_many :relatives,
           through: :relationships,
           source: :relative

  has_one :profile,         dependent: :destroy
  has_many :facts,          dependent: :destroy
  has_many :timeline_items, dependent: :destroy
  has_many :media,
           as: :attachable,
           dependent: :destroy
end
