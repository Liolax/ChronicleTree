# app/services/sibling_relationship_manager.rb
class SiblingRelationshipManager
  def self.update_sibling_relationships_for_person(person_id)
    new(person_id).update_sibling_relationships
  end

  def initialize(person_id)
    @person = Person.find(person_id)
  end

  def update_sibling_relationships
    # Find all potential siblings (people who share at least one parent)
    potential_siblings = find_potential_siblings
    
    # Create missing sibling relationships
    potential_siblings.each do |sibling|
      create_bidirectional_sibling_relationship(@person, sibling)
    end
  end

  private

  def find_potential_siblings
    # Get all parents of this person
    parent_ids = @person.parents.pluck(:id)
    return [] if parent_ids.empty?

    # Find all people who have at least one of these parents
    # excluding the person themselves
    Person.joins(:relationships)
          .where(relationships: { relationship_type: "child", relative_id: parent_ids })
          .where.not(id: @person.id)
          .distinct
  end

  def create_bidirectional_sibling_relationship(person1, person2)
    # Check if relationship already exists in either direction
    existing_rel1 = Relationship.find_by(
      person_id: person1.id,
      relative_id: person2.id,
      relationship_type: "sibling"
    )
    
    existing_rel2 = Relationship.find_by(
      person_id: person2.id,
      relative_id: person1.id,
      relationship_type: "sibling"
    )

    # Verify they actually share at least one parent before creating
    shared_parents = person1.parents & person2.parents
    if shared_parents.empty?
      Rails.logger.warn "Cannot create sibling relationship between #{person1.first_name} #{person1.last_name} (#{person1.id}) and #{person2.first_name} #{person2.last_name} (#{person2.id}): no shared parents"
      return
    end

    # Create the relationships if they don't exist
    unless existing_rel1
      Relationship.create!(
        person_id: person1.id,
        relative_id: person2.id,
        relationship_type: "sibling"
      )
    end

    unless existing_rel2
      Relationship.create!(
        person_id: person2.id,
        relative_id: person1.id,
        relationship_type: "sibling"
      )
    end
  end
end
