# app/models/relationship.rb
class Relationship < ApplicationRecord
  # the “owner” of this link
  belongs_to :person,
             class_name: 'Person',
             foreign_key: 'person_id',
             inverse_of: :relationships

  # the related family member
  belongs_to :relative,
             class_name: 'Person',
             foreign_key: 'relative_id',
             inverse_of: :related_by_relationships

  # optional: type of relationship (parent, child, spouse…)
  enum relationship_type: {
    parent: 0,
    child: 1,
    spouse: 2,
    sibling: 3
  }
end
