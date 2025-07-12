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
  validate  :valid_relationship_type

  private

  def person_is_not_relative
    errors.add(:relative, "can't be the same as person") if person == relative
  end

  def valid_relationship_type
    case relationship_type
    when 'parent', 'child'
      # Prevent parent/child relationships between spouses
      if person.spouses.include?(relative)
        errors.add(:base, 'A spouse cannot be a parent or child.')
      end
    when 'spouse'
      # Prevent spouse relationship between parent/child
      if person.parents.include?(relative) || person.children.include?(relative)
        errors.add(:base, 'A parent or child cannot be a spouse.')
      end
    when 'sibling'
      # Siblings must share at least one parent
      shared_parents = person.parents & relative.parents
      if shared_parents.empty?
        errors.add(:base, 'Siblings must share at least one parent.')
      end
    end
  end
end
