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

    # Get parents for both people
    person1_parents = person1.parents.to_a
    person2_parents = person2.parents.to_a
    shared_parents = person1_parents & person2_parents
    
    # Only create sibling relationships for FULL siblings (those who share ALL parents)
    # Step-siblings (who share some but not all parents) should NOT have explicit sibling relationships
    # The relationship calculator will handle step-sibling detection dynamically
    
    if shared_parents.empty?
      Rails.logger.warn "Cannot create sibling relationship between #{person1.first_name} #{person1.last_name} (#{person1.id}) and #{person2.first_name} #{person2.last_name} (#{person2.id}): no shared parents"
      return
    end
    
    # Check if they are FULL siblings (share ALL parents)
    # Both people must have the same number of parents and share all of them
    if person1_parents.length == person2_parents.length && 
       shared_parents.length == person1_parents.length &&
       person1_parents.length > 0
      
      Rails.logger.info "Creating FULL sibling relationship between #{person1.first_name} #{person1.last_name} and #{person2.first_name} #{person2.last_name} (shared #{shared_parents.length} parents)"
      
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
    else
      # They are step-siblings (share some but not all parents)
      # Do NOT create explicit sibling relationships
      # Let the relationship calculator handle this as step-sibling detection
      Rails.logger.info "Detected STEP-sibling relationship between #{person1.first_name} #{person1.last_name} and #{person2.first_name} #{person2.last_name} (shared #{shared_parents.length}/#{[person1_parents.length, person2_parents.length].max} parents) - no explicit relationship created"
      
      # Remove any existing incorrect sibling relationships
      existing_rel1&.destroy
      existing_rel2&.destroy
    end
  end
end
