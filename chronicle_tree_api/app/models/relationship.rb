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
  validate  :only_one_current_spouse, if: -> { relationship_type == 'spouse' && !is_ex }

  # Add a scope for ex-spouses
  scope :ex_spouses, -> { where(relationship_type: 'spouse', is_ex: true) }

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

  def only_one_current_spouse
    # Check if this is a new record or is being updated to current spouse
    # Only allow one current spouse per person (per direction)
    existing = Relationship.where(relationship_type: 'spouse', is_ex: false)
                          .where(person_id: person_id)
    # Exclude self if updating
    existing = existing.where.not(id: id) if persisted?
    if existing.exists?
      errors.add(:base, 'A person can only have one current spouse at a time.')
    end
  end
end
