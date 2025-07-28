# Fix the relationship creation - need bidirectional relationships
puts "Fixing bidirectional relationships for grandparents and grandchildren..."

person = Person.first

# Fix grandparent relationships
person.parents.each do |parent|
  puts "Checking parent: #{parent.full_name}"
  
  # Find potential grandparents that should be connected to this parent
  grandparents = person.user.people.where("first_name LIKE ?", "#{parent.first_name.first}%").where("last_name LIKE '%Grand%'")
  
  grandparents.each do |grandparent|
    # Create child relationship from grandparent to parent
    unless grandparent.relationships.exists?(relative_id: parent.id, relationship_type: 'child')
      grandparent.relationships.create!(
        relative_id: parent.id,
        relationship_type: 'child'
      )
      puts "  Added: #{grandparent.full_name} -> #{parent.full_name} (child)"
    end
    
    # Ensure parent -> grandparent relationship exists
    unless parent.relationships.exists?(relative_id: grandparent.id, relationship_type: 'parent')
      parent.relationships.create!(
        relative_id: grandparent.id,
        relationship_type: 'parent'
      )
      puts "  Added: #{parent.full_name} -> #{grandparent.full_name} (parent)"
    end
  end
end

# Fix grandchildren relationships  
person.children.each do |child|
  puts "Checking child: #{child.full_name}"
  
  # Find potential grandchildren that should be connected to this child
  grandchildren = person.user.people.where("first_name LIKE ?", "#{child.first_name}%").where("last_name LIKE '%Grand%'")
  
  grandchildren.each do |grandchild|
    # Create parent relationship from child to grandchild
    unless child.relationships.exists?(relative_id: grandchild.id, relationship_type: 'child')
      child.relationships.create!(
        relative_id: grandchild.id,
        relationship_type: 'child'
      )
      puts "  Added: #{child.full_name} -> #{grandchild.full_name} (child)"
    end
    
    # Create child relationship from grandchild to child
    unless grandchild.relationships.exists?(relative_id: child.id, relationship_type: 'parent')
      grandchild.relationships.create!(
        relative_id: child.id,
        relationship_type: 'parent'
      )
      puts "  Added: #{grandchild.full_name} -> #{child.full_name} (parent)"
    end
  end
end

# Verify the relationships now work
puts "\nVerifying relationships:"
puts "John's parents: #{person.parents.map(&:full_name).join(', ')}"
person.parents.each do |parent|
  puts "  #{parent.full_name}'s parents: #{parent.parents.map(&:full_name).join(', ')}"
end

puts "John's children: #{person.children.map(&:full_name).join(', ')}"
person.children.each do |child|
  puts "  #{child.full_name}'s children: #{child.children.map(&:full_name).join(', ')}"
end