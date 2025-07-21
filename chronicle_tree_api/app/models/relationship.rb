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
  validate  :minimum_marriage_age, if: -> { relationship_type == "spouse" }
  validate  :no_blood_relative_marriages, if: -> { relationship_type == "spouse" }
  validate  :no_blood_relative_children, if: -> { relationship_type == "child" }

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
        errors.add(:base, "Blood relatives cannot marry.")
      end
    when "spouse"
      # Prevent spouse relationship between parent/child
      if person.parents.include?(relative) || person.children.include?(relative)
        errors.add(:base, "Blood relatives cannot marry.")
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
      errors.add(:base, "Person already has a current spouse.")
    end
  end

  def minimum_marriage_age
    # Validate that both people in a spouse relationship are at least 16 years old
    return unless person&.date_of_birth && relative&.date_of_birth
    
    current_date = Date.current
    person_age = ((current_date - person.date_of_birth).to_f / 365.25).round(1)
    relative_age = ((current_date - relative.date_of_birth).to_f / 365.25).round(1)
    
    if person_age < 16
      errors.add(:base, "#{person.first_name} #{person.last_name} is only #{person_age} years old. Minimum marriage age is 16 years.")
    end
    
    if relative_age < 16
      errors.add(:base, "#{relative.first_name} #{relative.last_name} is only #{relative_age} years old. Minimum marriage age is 16 years.")
    end
  end

  def no_blood_relative_marriages
    # Prevent marriage between blood relatives
    return unless person && relative
    
    if BloodRelationshipDetector.blood_related?(person, relative)
      relationship_desc = BloodRelationshipDetector.new(person, relative).relationship_description
      errors.add(:base, "Blood relatives cannot marry. #{relationship_desc}.")
    end
  end

  def no_blood_relative_children
    # Prevent blood relatives from having shared children
    return unless person && relative
    
    # For child relationships, person is the parent and relative is the child
    # We need to check if the parent (person) and their spouse (other parent) are blood relatives
    parent = person
    child = relative
    
    # Get all other parents of this child
    other_parents = child.parents.where.not(id: parent.id)
    
    other_parents.each do |other_parent|
      if BloodRelationshipDetector.blood_related?(parent, other_parent)
        relationship_desc = BloodRelationshipDetector.new(parent, other_parent).relationship_description
        errors.add(:base, "Blood relatives cannot have children together. #{relationship_desc}.")
      end
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
