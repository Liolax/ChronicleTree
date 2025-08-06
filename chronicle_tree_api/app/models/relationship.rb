# Core relationship model for Chronicle Tree family tree project
# Handles complex family relationships including step-families, marriages, and divorces
class Relationship < ApplicationRecord
  include PaperTrailCustom
  chronicle_versioned

  belongs_to :person,
             class_name: "Person",
             foreign_key: "person_id",
             inverse_of: :relationships

  belongs_to :relative,
             class_name: "Person",
             foreign_key: "relative_id",
             inverse_of: :related_by_relationships

  belongs_to :shared_parent,
             class_name: "Person",
             foreign_key: "shared_parent_id",
             optional: true

  validates :relationship_type, presence: true
  validate  :person_is_not_relative
  validate  :valid_relationship_type
  validate  :only_one_current_spouse, if: -> { relationship_type == "spouse" && !is_ex && !is_deceased }
  validate  :minimum_marriage_age, if: -> { relationship_type == "spouse" }
  validate  :no_blood_relative_marriages, if: -> { relationship_type == "spouse" }
  validate  :no_blood_relative_children, if: -> { relationship_type == "child" }

  scope :ex_spouses, -> { where(relationship_type: "spouse", is_ex: true) }
  scope :deceased_spouses, -> { where(relationship_type: "spouse", is_deceased: true) }
  scope :current_spouses, -> { where(relationship_type: "spouse", is_ex: false, is_deceased: false) }

  after_create :update_sibling_relationships, if: -> { relationship_type == "child" || relationship_type == "parent" }
  after_update :sync_reciprocal_spouse_status, if: -> { relationship_type == "spouse" && (saved_change_to_is_ex? || saved_change_to_is_deceased?) }

  private

  def person_is_not_relative
    errors.add(:relative, "can't be the same as person") if person == relative
  end

  def valid_relationship_type
    case relationship_type
    when "parent", "child"
      if person.spouses.include?(relative)
        errors.add(:base, "Blood relatives cannot marry.")
      end
    when "spouse"
      if person.parents.include?(relative) || person.children.include?(relative)
        errors.add(:base, "Blood relatives cannot marry.")
      end
    when "sibling"
      person_parents = person.parents.pluck(:id)
      relative_parents = relative.parents.pluck(:id)
      
      if person_parents.count == 2 && relative_parents.count == 2
        shared_parents = person_parents & relative_parents
        has_step_relationship = false
        
        if shared_parents.empty?
          person.parents.each do |person_parent|
            relative.parents.each do |relative_parent|
              if person_parent.spouses.include?(relative_parent)
                has_step_relationship = true
                break
              end
            end
            break if has_step_relationship
          end
          
          unless has_step_relationship
            errors.add(:base, "People with 2 complete different blood parents cannot be siblings unless their parents are married to each other.")
          end
        end
      end
    end
  end

  def only_one_current_spouse
    existing = Relationship.joins(:relative)
                          .where(relationship_type: "spouse", is_ex: false, is_deceased: false)
                          .where(person_id: person_id)
                          .where(people: { date_of_death: nil })
    
    existing = existing.where.not(id: id) if persisted?
    
    if existing.exists?
      errors.add(:base, "Person already has a current spouse.")
    end
  end

  def minimum_marriage_age
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
    return unless person && relative
    
    if BloodRelationshipDetector.blood_related?(person, relative)
      relationship_desc = BloodRelationshipDetector.new(person, relative).relationship_description
      errors.add(:base, "Blood relatives cannot marry. #{relationship_desc}.")
    end
  end

  def no_blood_relative_children
    return unless person && relative
    
    parent = person
    child = relative
    other_parents = child.parents.where.not(id: parent.id)
    
    other_parents.each do |other_parent|
      if BloodRelationshipDetector.blood_related?(parent, other_parent)
        relationship_desc = BloodRelationshipDetector.new(parent, other_parent).relationship_description
        errors.add(:base, "Blood relatives cannot have children together. #{relationship_desc}.")
      end
    end
  end

  def sync_reciprocal_spouse_status
    reciprocal = Relationship.find_by(
      person_id: relative_id,
      relative_id: person_id,
      relationship_type: "spouse"
    )
    
    if reciprocal
      # When is_ex changes from true to false, check if person is actually deceased
      # and restore the is_deceased status appropriately
      if saved_change_to_is_ex? && is_ex == false && was_ex_now_current?
        if person.date_of_death || person.is_deceased
          self.is_deceased = true
          reciprocal.update_column(:is_deceased, true)
        elsif relative.date_of_death || relative.is_deceased
          reciprocal.is_deceased = true
          reciprocal.save!
        else
          # Both alive, ensure not marked as deceased
          self.is_deceased = false
          reciprocal.update_column(:is_deceased, false)
        end
      end
      
      # Sync is_ex status
      if reciprocal.is_ex != is_ex
        reciprocal.update_column(:is_ex, is_ex)
      end
      
      # Sync is_deceased status (if not handled above)
      if reciprocal.is_deceased != is_deceased && !saved_change_to_is_ex?
        reciprocal.update_column(:is_deceased, is_deceased)
      end
    end
  end

  private

  def was_ex_now_current?
    saved_change_to_is_ex? && saved_change_to_is_ex[0] == true && saved_change_to_is_ex[1] == false
  end

  def update_sibling_relationships
    if relationship_type == "child"
      SiblingRelationshipManager.update_sibling_relationships_for_person(relative_id)
    elsif relationship_type == "parent"
      SiblingRelationshipManager.update_sibling_relationships_for_person(person_id)
    end
  end
end
