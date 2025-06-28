# app/models/person.rb
class Person < ApplicationRecord
  # outgoing links (e.g. “Alice is parent of Bob”)
  has_many :relationships,
           class_name: 'Relationship',
           foreign_key: 'person_id',
           inverse_of: :person
           
  has_many :related_by_relationships,
           class_name: 'Relationship',
           foreign_key: 'relative_id',
           inverse_of: :relative

  # through relationships, get Person relatives
  has_many :relatives,
           through: :relationships,
           source: :relative

  belongs_to :user
end
