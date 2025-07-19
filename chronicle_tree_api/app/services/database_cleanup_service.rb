# Database Cleanup Script for Cross-Generational Sibling Relationships
# This script identifies and removes invalid sibling relationships that span generations

class DatabaseCleanupService
  def self.clean_cross_generational_siblings
    puts "🔍 Analyzing cross-generational sibling relationships..."
    
    invalid_siblings = find_invalid_cross_generational_siblings
    
    if invalid_siblings.empty?
      puts "✅ No invalid cross-generational sibling relationships found!"
      return
    end
    
    puts "⚠️  Found #{invalid_siblings.count} invalid cross-generational sibling relationships:"
    
    invalid_siblings.each do |relationship|
      person_a = Person.find(relationship.person_a_id)
      person_b = Person.find(relationship.person_b_id)
      puts "   - #{person_a.first_name} #{person_a.last_name} <-> #{person_b.first_name} #{person_b.last_name}"
    end
    
    puts "\n🧹 Removing invalid relationships..."
    
    removed_count = 0
    invalid_siblings.each do |relationship|
      # Remove both directions of the sibling relationship
      bidirectional_relationships = Relationship.where(
        "(person_a_id = ? AND person_b_id = ?) OR (person_a_id = ? AND person_b_id = ?)",
        relationship.person_a_id, relationship.person_b_id,
        relationship.person_b_id, relationship.person_a_id
      ).where(relationship_type: 'Sibling')
      
      bidirectional_relationships.destroy_all
      removed_count += bidirectional_relationships.count
    end
    
    puts "✅ Successfully removed #{removed_count} invalid sibling relationships!"
    puts "💡 Note: Valid generational relationships (Parent, Grandparent, etc.) remain intact."
  end
  
  private
  
  def self.find_invalid_cross_generational_siblings
    invalid_relationships = []
    
    # Find all sibling relationships
    sibling_relationships = Relationship.where(relationship_type: 'Sibling')
    
    sibling_relationships.each do |relationship|
      person_a_id = relationship.person_a_id
      person_b_id = relationship.person_b_id
      
      # Check if these "siblings" have a generational relationship (one is ancestor of the other)
      if has_generational_relationship?(person_a_id, person_b_id)
        invalid_relationships << relationship
      end
    end
    
    invalid_relationships
  end
  
  def self.has_generational_relationship?(person_a_id, person_b_id)
    # Check if person_a is an ancestor of person_b
    return true if is_ancestor?(person_a_id, person_b_id)
    
    # Check if person_b is an ancestor of person_a
    return true if is_ancestor?(person_b_id, person_a_id)
    
    false
  end
  
  def self.is_ancestor?(ancestor_id, descendant_id, visited = Set.new)
    # Prevent infinite loops
    return false if visited.include?(descendant_id)
    visited.add(descendant_id)
    
    # Find direct parents of the descendant
    parent_relationships = Relationship.where(
      person_b_id: descendant_id,
      relationship_type: 'Parent'
    )
    
    parent_relationships.each do |rel|
      parent_id = rel.person_a_id
      
      # Direct parent match
      return true if parent_id == ancestor_id
      
      # Recursive check for grandparents, great-grandparents, etc.
      return true if is_ancestor?(ancestor_id, parent_id, visited)
    end
    
    false
  end
end

# Preview mode - shows what would be cleaned without making changes
class DatabaseCleanupPreview
  def self.preview_cleanup
    puts "🔍 PREVIEW MODE - No changes will be made"
    puts "=" * 50
    
    invalid_siblings = DatabaseCleanupService.send(:find_invalid_cross_generational_siblings)
    
    if invalid_siblings.empty?
      puts "✅ No invalid cross-generational sibling relationships found!"
      return
    end
    
    puts "⚠️  Found #{invalid_siblings.count} invalid cross-generational sibling relationships:"
    puts
    
    invalid_siblings.each do |relationship|
      person_a = Person.find(relationship.person_a_id)
      person_b = Person.find(relationship.person_b_id)
      
      # Determine the correct relationship
      correct_relationship = determine_correct_relationship(relationship.person_a_id, relationship.person_b_id)
      
      puts "❌ INVALID: #{person_a.first_name} #{person_a.last_name} <-> #{person_b.first_name} #{person_b.last_name} (marked as Siblings)"
      puts "✅ CORRECT: #{person_a.first_name} should be #{correct_relationship} to #{person_b.first_name}"
      puts
    end
    
    puts "💡 To apply these changes, run: DatabaseCleanupService.clean_cross_generational_siblings"
  end
  
  private
  
  def self.determine_correct_relationship(person_a_id, person_b_id)
    # Use the relationship calculator to determine the correct relationship
    if DatabaseCleanupService.send(:is_ancestor?, person_a_id, person_b_id)
      # person_a is ancestor of person_b
      depth = calculate_generational_depth(person_a_id, person_b_id)
      case depth
      when 1 then "Parent"
      when 2 then "Grandparent"
      when 3 then "Great-Grandparent"
      else "#{depth - 2}x Great-Grandparent"
      end
    elsif DatabaseCleanupService.send(:is_ancestor?, person_b_id, person_a_id)
      # person_b is ancestor of person_a
      depth = calculate_generational_depth(person_b_id, person_a_id)
      case depth
      when 1 then "Child"
      when 2 then "Grandchild"
      when 3 then "Great-Grandchild"
      else "#{depth - 2}x Great-Grandchild"
      end
    else
      "Unrelated or Complex Relationship"
    end
  end
  
  def self.calculate_generational_depth(ancestor_id, descendant_id, depth = 0)
    return depth if ancestor_id == descendant_id
    
    parent_relationships = Relationship.where(
      person_b_id: descendant_id,
      relationship_type: 'Parent'
    )
    
    parent_relationships.each do |rel|
      parent_id = rel.person_a_id
      result = calculate_generational_depth(ancestor_id, parent_id, depth + 1)
      return result if result > 0
    end
    
    0
  end
end
