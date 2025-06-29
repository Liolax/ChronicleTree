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

  # Methods to query relationships
  def parents
    relatives.where(relationships: { relationship_type: 'parent' })
  end

  def children
    relative_people.where(relationships: { person_id: id, relationship_type: 'parent' })
  end

  def spouses
    relatives.where(relationships: { relationship_type: 'spouse' })
  end

  def siblings
    # Siblings share at least one parent
    return Person.none if parents.empty?

    Person.joins(:related_by_relationships)
          .where(related_by_relationships: {
                   relationship_type: 'parent',
                   relative_id: parents.ids
                 })
          .where.not(id: id)
          .distinct
  end

  private

  def relative_people
    Person.joins(:relationships).where(relationships: { relative_id: id })
  end
end
