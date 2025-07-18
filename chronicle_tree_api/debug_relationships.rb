# Debug script to investigate Charlie/David relationship issue
puts "=== CHARLIE/DAVID RELATIONSHIP DEBUG ==="

# Find Charlie and David
charlie = Person.find_by(first_name: 'Charlie')
david = Person.find_by(first_name: 'David')

puts "Charlie: #{charlie.inspect}"
puts "David: #{david.inspect}"

if charlie && david
  puts "\n=== CHARLIE'S RELATIONSHIPS ==="
  charlie.relationships.each do |rel|
    relative = Person.find(rel.relative_id)
    puts "Charlie (#{charlie.id}) -> #{relative.first_name} #{relative.last_name} (#{rel.relative_id}): #{rel.relationship_type}#{rel.is_ex ? ' (ex)' : ''}"
  end
  
  puts "\n=== DAVID'S RELATIONSHIPS ==="
  david.relationships.each do |rel|
    relative = Person.find(rel.relative_id)
    puts "David (#{david.id}) -> #{relative.first_name} #{relative.last_name} (#{rel.relative_id}): #{rel.relationship_type}#{rel.is_ex ? ' (ex)' : ''}"
  end
  
  puts "\n=== PARENT-CHILD ANALYSIS ==="
  
  # Check Charlie's children
  charlie_children = charlie.relationships.where(relationship_type: 'child').includes(:relative)
  puts "Charlie's children:"
  charlie_children.each do |rel|
    puts "  - #{rel.relative.first_name} #{rel.relative.last_name} (#{rel.relative_id})"
  end
  
  if charlie_children.empty?
    puts "  ✅ Charlie has NO children"
  end
  
  # Check David's children
  david_children = david.relationships.where(relationship_type: 'child').includes(:relative)
  puts "David's children:"
  david_children.each do |rel|
    puts "  - #{rel.relative.first_name} #{rel.relative.last_name} (#{rel.relative_id})"
  end
  
  puts "\n=== CO-PARENT-IN-LAW ANALYSIS ==="
  puts "For co-parent-in-law relationship to exist:"
  puts "- Charlie's child must be married to David's child"
  puts "- OR David's child must be married to Charlie's child"
  
  # Check if any of Charlie's children are married to any of David's children
  found_co_parent_relation = false
  
  charlie_children.each do |charlie_child_rel|
    charlie_child = charlie_child_rel.relative
    
    david_children.each do |david_child_rel|
      david_child = david_child_rel.relative
      
      # Check if Charlie's child is married to David's child
      spouse_relation = charlie_child.relationships.find_by(
        relative_id: david_child.id, 
        relationship_type: 'spouse'
      )
      
      if spouse_relation
        puts "  ✅ FOUND: #{charlie_child.first_name} (Charlie's child) married to #{david_child.first_name} (David's child) #{spouse_relation.is_ex ? '(ex)' : '(current)'}"
        found_co_parent_relation = true
      end
    end
  end
  
  if !found_co_parent_relation
    puts "  ❌ NO co-parent-in-law relationship should exist"
    puts "  Reason: #{charlie_children.empty? ? 'Charlie has no children' : 'No marriages between their children'}"
  end
  
  puts "\n=== BROTHER-IN-LAW ANALYSIS ==="
  
  # Check if David is current spouse of Charlie's siblings
  charlie_siblings = charlie.relationships.where(relationship_type: 'sibling').includes(:relative)
  puts "Charlie's siblings:"
  charlie_siblings.each do |sib_rel|
    sibling = sib_rel.relative
    puts "  - #{sibling.first_name} #{sibling.last_name} (#{sibling.id})"
    
    # Check sibling's current spouses
    sibling_spouses = sibling.relationships.where(relationship_type: 'spouse', is_ex: false).includes(:relative)
    puts "    Current spouses: #{sibling_spouses.map { |s| s.relative.first_name }.join(', ')}"
    
    # Check if David is among the current spouses
    if sibling_spouses.any? { |s| s.relative_id == david.id }
      puts "    ✅ David is CURRENT spouse of Charlie's sibling #{sibling.first_name}"
    else
      # Check ex-spouses
      ex_spouses = sibling.relationships.where(relationship_type: 'spouse', is_ex: true).includes(:relative)
      if ex_spouses.any? { |s| s.relative_id == david.id }
        puts "    ❌ David is EX-spouse of Charlie's sibling #{sibling.first_name} (brother-in-law relationship ended)"
      end
    end
  end
  
  puts "\n=== EXPECTED RESULT ==="
  puts "David should be 'Unrelated' to Charlie because:"
  puts "1. Charlie has no children (no co-parent-in-law)"
  puts "2. David is ex-spouse of Charlie's sister (brother-in-law ended after divorce)"
  
else
  puts "❌ Could not find Charlie or David in database"
end
