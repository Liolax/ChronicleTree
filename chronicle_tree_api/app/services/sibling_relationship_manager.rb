# app/services/sibling_relationship_manager.rb
class SiblingRelationshipManager
  def self.update_sibling_relationships_for_person(person_id)
    new(person_id).update_sibling_relationships
  end

  def initialize(person_id)
    @person = Person.find(person_id)
  end

  def update_sibling_relationships
    potential_siblings = find_potential_siblings
    
    potential_siblings.each do |sibling|
      create_bidirectional_sibling_relationship(@person, sibling)
    end
  end

  private

  def find_potential_siblings
    parent_ids = @person.parents.pluck(:id)
    return [] if parent_ids.empty?

    Person.joins(:relationships)
          .where(relationships: { relationship_type: "child", relative_id: parent_ids })
          .where.not(id: @person.id)
          .distinct
  end

  def create_bidirectional_sibling_relationship(person1, person2)
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

    person1_parents = person1.parents.to_a
    person2_parents = person2.parents.to_a
    shared_parents = person1_parents & person2_parents
    
    if shared_parents.empty?
      return
    end
    
    if person1_parents.length == person2_parents.length && 
       shared_parents.length == person1_parents.length &&
       person1_parents.length > 0
      
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
      existing_rel1&.destroy
      existing_rel2&.destroy
    end
  end
end
