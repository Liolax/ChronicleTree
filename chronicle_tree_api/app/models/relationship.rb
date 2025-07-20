# app/models/relationship.rb
class Relationship < ApplicationRecord
  belongs_to :person,
             class_name: "Person",
             foreign_key: "person_id",
             inverse_of: :relationships

  belongs_to :relative,
             class_name: "Person",
             foreign_key: "relative_id",
             inverse_of: :related_by_relationships

  validates :relationship_type, presence: true
  validate  :person_is_not_relative
  validate  :valid_relationship_type
  validate  :only_one_current_spouse, if: -> { relationship_type == "spouse" && !is_ex && !is_deceased }

  # Add scopes for different spouse types
  scope :ex_spouses, -> { where(relationship_type: "spouse", is_ex: true) }
  scope :deceased_spouses, -> { where(relationship_type: "spouse", is_deceased: true) }
  scope :current_spouses, -> { where(relationship_type: "spouse", is_ex: false, is_deceased: false) }

  # After creating/updating parent-child relationships, update sibling relationships
  after_create :update_sibling_relationships, if: -> { relationship_type == "child" || relationship_type == "parent" }
  after_update :sync_reciprocal_spouse_status, if: -> { relationship_type == "spouse" && (saved_change_to_is_ex? || saved_change_to_is_deceased?) }

  private

  def person_is_not_relative
    errors.add(:relative, "can't be the same as person") if person == relative
  end

  def valid_relationship_type
    case relationship_type
    when "parent", "child"
      # Prevent parent/child relationships between spouses
      if person.spouses.include?(relative)
        errors.add(:base, "A spouse cannot be a parent or child.")
      end
    when "spouse"
      # Prevent spouse relationship between parent/child
      if person.parents.include?(relative) || person.children.include?(relative)
        errors.add(:base, "A parent or child cannot be a spouse.")
      end
    when "sibling"
      # Siblings must share at least one parent
      shared_parents = person.parents & relative.parents
      if shared_parents.empty?
        errors.add(:base, "Siblings must share at least one parent.")
      end
    end
  end

  def only_one_current_spouse
    # Check if this is a new record or is being updated to current spouse
    # Only allow one current spouse per person (per direction)
    # Also consider spouses with date_of_death as effectively "not current"
    existing = Relationship.joins(:relative)
                          .where(relationship_type: "spouse", is_ex: false, is_deceased: false)
                          .where(person_id: person_id)
                          .where(people: { date_of_death: nil }) # Exclude deceased spouses
    
    # Exclude self if updating
    existing = existing.where.not(id: id) if persisted?
    
    if existing.exists?
      errors.add(:base, "A person can only have one current spouse at a time.")
    end
  end

  def sync_reciprocal_spouse_status
    # Find the reciprocal spouse relationship
    reciprocal = Relationship.find_by(
      person_id: relative_id,
      relative_id: person_id,
      relationship_type: "spouse"
    )
    
    if reciprocal
      # Update both is_ex and is_deceased without triggering callbacks to avoid infinite loop
      if reciprocal.is_ex != is_ex
        reciprocal.update_column(:is_ex, is_ex)
      end
      
      if reciprocal.is_deceased != is_deceased
        reciprocal.update_column(:is_deceased, is_deceased)
      end
    end
  end

  def update_sibling_relationships
    # Update sibling relationships for both the person and the relative
    # when a parent-child relationship is created
    if relationship_type == "child"
      # person_id is the parent, relative_id is the child
      # Update siblings for the child
      SiblingRelationshipManager.update_sibling_relationships_for_person(relative_id)
    elsif relationship_type == "parent"
      # person_id is the child, relative_id is the parent
      # Update siblings for the child
      SiblingRelationshipManager.update_sibling_relationships_for_person(person_id)
    end
  end
end
