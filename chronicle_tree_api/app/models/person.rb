# Central person model for Chronicle Tree family tree project
# Manages family relationships, genealogical connections, and demographic data
class Person < ApplicationRecord
  include PaperTrailCustom
  chronicle_versioned

  belongs_to :user

  has_many :relationships,
           class_name: "Relationship",
           foreign_key: "person_id",
           inverse_of: :person,
           dependent: :destroy

  has_many :related_by_relationships,
           class_name: "Relationship",
           foreign_key: "relative_id",
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
  has_one :note, dependent: :destroy
  has_many :share_images, dependent: :destroy

  after_create :ensure_profile

  def full_name
    "#{first_name} #{last_name}".strip
  end

  def display_name
    full_name.present? ? full_name : name
  end

  def parents
    relatives.where(relationships: { relationship_type: "parent" })
  end

  def children
    relatives.where(relationships: { relationship_type: "child" })
  end

  def spouses
    Person.joins(:relationships)
          .where(
            "(relationships.person_id = :id OR relationships.relative_id = :id) AND relationships.relationship_type = 'spouse'",
            id: id
          )
          .where.not(id: id)
          .distinct
  end

  def all_spouses_including_deceased
    Person.joins(:relationships)
          .where(
            "(relationships.person_id = :id OR relationships.relative_id = :id) AND relationships.relationship_type = 'spouse' AND relationships.is_ex = false",
            id: id
          )
          .where.not(id: id)
          .distinct
  end

  def current_spouses
    Person.joins(:relationships)
          .where(
            "(relationships.person_id = :id OR relationships.relative_id = :id) AND relationships.relationship_type = 'spouse' AND relationships.is_ex = false",
            id: id
          )
          .where(date_of_death: nil)
          .where.not(id: id)
          .distinct
  end

  def ex_spouses
    Person.joins(:relationships)
          .where(
            "(relationships.person_id = :id OR relationships.relative_id = :id) AND relationships.relationship_type = 'spouse' AND relationships.is_ex = true",
            id: id
          )
          .where.not(id: id)
          .distinct
  end

  def deceased_spouses
    Person.joins(:relationships)
          .where(
            "(relationships.person_id = :id OR relationships.relative_id = :id) AND relationships.relationship_type = 'spouse' AND relationships.is_ex = false",
            id: id
          )
          .where.not(date_of_death: nil)
          .where.not(id: id)
          .distinct
  end

  def is_deceased?
    date_of_death.present?
  end

  def marriage_age_valid?
    return { valid: true } unless date_of_birth.present?
    
    current_date = Date.current
    age = ((current_date - date_of_birth).to_f / 365.25).round(1)
    
    spouse_relationships = relationships.where(relationship_type: "spouse") + 
                          related_by_relationships.where(relationship_type: "spouse")
    
    if spouse_relationships.any? && age < 16
      return { 
        valid: false, 
        error: "#{first_name} #{last_name} is only #{age} years old. Minimum marriage age is 16 years."
      }
    end
    
    { valid: true }
  end

  def can_be_parent_of?(child)
    return { valid: false, error: "Child person is required" } if child.nil?
    return { valid: false, error: "Parent cannot be same as child" } if self == child

    if self.date_of_birth.present? && child.date_of_birth.present?
      parent_birth = Date.parse(self.date_of_birth.to_s)
      child_birth = Date.parse(child.date_of_birth.to_s)
      age_difference = (child_birth - parent_birth) / 365.25

      if age_difference < 12
        if age_difference < 0
          return { 
            valid: false, 
            error: "#{self.first_name} #{self.last_name} (born #{parent_birth.strftime('%B %d, %Y')}) is #{age_difference.abs.round(1)} years YOUNGER than #{child.first_name} #{child.last_name} (born #{child_birth.strftime('%B %d, %Y')}). A parent cannot be younger than their child."
          }
        else
          return { 
            valid: false, 
            error: "#{self.first_name} #{self.last_name} (born #{parent_birth.strftime('%B %d, %Y')}) is only #{age_difference.round(1)} years older than #{child.first_name} #{child.last_name} (born #{child_birth.strftime('%B %d, %Y')}). A parent must be at least 12 years older than their child."
          }
        end
      end
    end

    if self.date_of_death.present? && child.date_of_birth.present?
      parent_death = Date.parse(self.date_of_death.to_s)
      child_birth = Date.parse(child.date_of_birth.to_s)

      if child_birth > parent_death
        return { 
          valid: false, 
          error: "#{self.first_name} #{self.last_name} died on #{parent_death.strftime('%B %d, %Y')}, but #{child.first_name} #{child.last_name} was born on #{child_birth.strftime('%B %d, %Y')}."
        }
      end
    end

    if child.parents.count >= 2
      existing_parents = child.parents.map { |p| "#{p.first_name} #{p.last_name}" }.join(' and ')
      return { 
        valid: false, 
        error: "#{child.first_name} #{child.last_name} already has 2 biological parents: #{existing_parents}. A person can only have 2 biological parents."
      }
    end

    { valid: true }
  end

  def siblings
    full_siblings
  end

  def full_siblings
    parent_ids = parents.pluck(:id)
    return [] if parent_ids.size != 2

    potential_siblings = Person.joins(:related_by_relationships)
          .where(related_by_relationships: { relationship_type: "child", person_id: parent_ids })
          .where.not(id: id)
          .distinct.to_a

    potential_siblings.select do |sibling|
      sibling_parent_ids = sibling.parents.pluck(:id).sort
      parent_ids.sort == sibling_parent_ids && sibling_parent_ids.size == 2
    end
  end

  def half_siblings
    parent_ids = parents.pluck(:id)
    return [] if parent_ids.empty?

    potential_siblings = Person.joins(:related_by_relationships)
          .where(related_by_relationships: { relationship_type: "child", person_id: parent_ids })
          .where.not(id: id)
          .distinct.to_a

    potential_siblings.select do |sibling|
      sibling_parent_ids = sibling.parents.pluck(:id)
      shared_parents = (parent_ids & sibling_parent_ids).size
      shared_parents == 1
    end
  end

  def step_siblings
    parent_ids = parents.pluck(:id)
    return [] if parent_ids.empty?

    step_siblings = []
    
    parents.each do |parent|
      current_spouses = parent.current_spouses
      
      current_spouses.each do |spouse|
        spouse_children = spouse.children.to_a
        
        spouse_children.each do |child|
          next if child.id == self.id
          
          child_parent_ids = child.parents.pluck(:id)
          shared_blood_parents = (parent_ids & child_parent_ids).size
          
          if shared_blood_parents == 0
            step_siblings << child unless step_siblings.include?(child)
          end
        end
      end
    end
    
    step_siblings
  end

  def parents_in_law
    return [] if is_deceased?
    
    all_parents = current_spouses.flat_map do |spouse|
      spouse.parents
    end
    all_parents.uniq.reject { |p| p == self || current_spouses.include?(p) }
  end

  def children_in_law
    return [] if is_deceased?
    
    all_spouses = children.flat_map do |child|
      child.current_spouses
    end
    all_spouses.uniq.reject { |p| p == self || children.include?(p) }
  end

  def siblings_in_law
    return [] if is_deceased?
    
    all_siblings = current_spouses.flat_map do |spouse|
      spouse.siblings
    end
    all_siblings.uniq.reject { |p| p == self || current_spouses.include?(p) }
  end

  private

  def ensure_profile
    Profile.find_or_create_by!(person: self)
  end

  def relative_people
    Person.joins(:relationships).where(relationships: { relative_id: id })
  end
end
