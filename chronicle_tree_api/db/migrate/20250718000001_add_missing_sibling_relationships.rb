class AddMissingSiblingRelationships < ActiveRecord::Migration[7.0]
  def up
    # Find all people who have parents and might need sibling relationships
    Person.joins(:relationships)
          .where(relationships: { relationship_type: "parent" })
          .distinct
          .find_each do |person|
      SiblingRelationshipManager.update_sibling_relationships_for_person(person.id)
    end
  end

  def down
    # Remove all sibling relationships created by this migration
    # This is optional - you may want to keep them
    # Relationship.where(relationship_type: "sibling").destroy_all
  end
end
