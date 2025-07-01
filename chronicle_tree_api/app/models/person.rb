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
  has_one :note, dependent: :destroy

  # Methods to query relationships
  def parents
    Person.joins(:relationships)
          .where(relationships: { relative_id: id, relationship_type: 'child' })
  end

  def children
    relatives.where(relationships: { relationship_type: 'child' })
  end

  def spouses
    Person.joins(:relationships)
          .where(relationships: { person_id: id, relationship_type: 'spouse' })
  end

  def siblings
    # Siblings share at least one parent
    parent_ids = parents.pluck(:id)
    return Person.none if parent_ids.empty?

    Person.joins(:relationships)
          .where(relationships: { relationship_type: 'child', relative_id: parent_ids })
          .where.not(id: id)
          .distinct
  end

  private

  def relative_people
    Person.joins(:relationships).where(relationships: { relative_id: id })
  end
end
