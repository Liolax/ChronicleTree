# app/models/person.rb
class Person < ApplicationRecord
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

  after_create :ensure_profile

  # Methods to query relationships
  def parents
    Person.joins(:relationships)
          .where(relationships: { relative_id: id, relationship_type: "child" })
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

  def current_spouses
    Person.joins(:relationships)
          .where(
            "(relationships.person_id = :id OR relationships.relative_id = :id) AND relationships.relationship_type = 'spouse' AND relationships.is_ex = false",
            id: id
          )
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

  def siblings
    # Get explicitly defined sibling relationships
    Person.joins(:relationships)
          .where(
            "(relationships.person_id = :id OR relationships.relative_id = :id) AND relationships.relationship_type = 'sibling'",
            id: id
          )
          .where.not(id: id)
          .distinct
  end

  def parents_in_law
    # DEBUG: Print current spouses and their parents for this person
    Rails.logger.debug "[parents_in_law] Person: #{self.first_name} #{self.last_name} (id=#{self.id})"
    Rails.logger.debug "[parents_in_law] Current Spouses: #{current_spouses.map { |s| "#{s.first_name} #{s.last_name} (id=#{s.id})" }.inspect}"
    all_parents = current_spouses.flat_map do |spouse|
      prnts = spouse.parents
      Rails.logger.debug "[parents_in_law] Spouse: #{spouse.first_name} #{spouse.last_name} (id=#{spouse.id}) Parents: #{prnts.map { |p| "#{p.first_name} #{p.last_name} (id=#{p.id})" }.inspect}"
      prnts
    end
    all_parents.uniq.reject { |p| p == self || current_spouses.include?(p) }
  end

  def children_in_law
    # DEBUG: Print children and their current spouses for this person
    Rails.logger.debug "[children_in_law] Person: #{self.first_name} #{self.last_name} (id=#{self.id})"
    Rails.logger.debug "[children_in_law] Children: #{children.map { |c| "#{c.first_name} #{c.last_name} (id=#{c.id})" }.inspect}"
    all_spouses = children.flat_map do |child|
      sps = child.current_spouses
      Rails.logger.debug "[children_in_law] Child: #{child.first_name} #{child.last_name} (id=#{child.id}) Current Spouses: #{sps.map { |s| "#{s.first_name} #{s.last_name} (id=#{s.id})" }.inspect}"
      sps
    end
    all_spouses.uniq.reject { |p| p == self || children.include?(p) }
  end

  def siblings_in_law
    # DEBUG: Print current spouses and their siblings for this person
    Rails.logger.debug "[siblings_in_law] Person: #{self.first_name} #{self.last_name} (id=#{self.id})"
    Rails.logger.debug "[siblings_in_law] Current Spouses: #{current_spouses.map { |s| "#{s.first_name} #{s.last_name} (id=#{s.id})" }.inspect}"
    all_siblings = current_spouses.flat_map do |spouse|
      sibs = spouse.siblings
      Rails.logger.debug "[siblings_in_law] Spouse: #{spouse.first_name} #{spouse.last_name} (id=#{spouse.id}) Siblings: #{sibs.map { |s| "#{s.first_name} #{s.last_name} (id=#{s.id})" }.inspect}"
      sibs
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
