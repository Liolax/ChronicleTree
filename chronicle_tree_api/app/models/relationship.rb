# app/models/relationship.rb
class Relationship < ApplicationRecord
  belongs_to :person,
             class_name: 'Person',
             foreign_key: 'person_id',
             inverse_of: :relationships

  belongs_to :relative,
             class_name: 'Person',
             foreign_key: 'relative_id',
             inverse_of: :related_by_relationships

  validates :relationship_type, presence: true
  validate  :person_is_not_relative

  private

  def person_is_not_relative
    errors.add(:relative, "can't be the same as person") if person == relative
  end
end
