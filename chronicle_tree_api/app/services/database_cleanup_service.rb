class DatabaseCleanupService
  def self.clean_cross_generational_siblings
    invalid_siblings = find_invalid_cross_generational_siblings
    
    return if invalid_siblings.empty?
    
    removed_count = 0
    invalid_siblings.each do |relationship|
      bidirectional_relationships = Relationship.where(
        "(person_a_id = ? AND person_b_id = ?) OR (person_a_id = ? AND person_b_id = ?)",
        relationship.person_a_id, relationship.person_b_id,
        relationship.person_b_id, relationship.person_a_id
      ).where(relationship_type: 'Sibling')
      
      bidirectional_relationships.destroy_all
      removed_count += bidirectional_relationships.count
    end
  end
  
  private
  
  def self.find_invalid_cross_generational_siblings
    invalid_relationships = []
    
    sibling_relationships = Relationship.where(relationship_type: 'Sibling')
    
    sibling_relationships.each do |relationship|
      person_a_id = relationship.person_a_id
      person_b_id = relationship.person_b_id
      
      if has_generational_relationship?(person_a_id, person_b_id)
        invalid_relationships << relationship
      end
    end
    
    invalid_relationships
  end
  
  def self.has_generational_relationship?(person_a_id, person_b_id)
    return true if is_ancestor?(person_a_id, person_b_id)
    return true if is_ancestor?(person_b_id, person_a_id)
    
    false
  end
  
  def self.is_ancestor?(ancestor_id, descendant_id, visited = Set.new)
    return false if visited.include?(descendant_id)
    visited.add(descendant_id)
    
    parent_relationships = Relationship.where(
      person_b_id: descendant_id,
      relationship_type: 'Parent'
    )
    
    parent_relationships.each do |rel|
      parent_id = rel.person_a_id
      
      return true if parent_id == ancestor_id
      return true if is_ancestor?(ancestor_id, parent_id, visited)
    end
    
    false
  end
end
