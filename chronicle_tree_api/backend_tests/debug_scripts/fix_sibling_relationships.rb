# Fix incorrect sibling relationships - remove step-sibling relationships that were created as full siblings

puts "=== FIXING INCORRECT SIBLING RELATIONSHIPS ==="

# Find Alice and Michael
alice = Person.find_by(first_name: 'Alice', last_name: 'Doe')
michael = Person.find_by(first_name: 'Michael', last_name: 'Doe')

if alice && michael
  # Check their parents
  alice_parents = alice.parents.to_a
  michael_parents = michael.parents.to_a
  shared_parents = alice_parents & michael_parents
  
  # Check if they are full siblings or step-siblings
  if alice_parents.length == michael_parents.length && 
     shared_parents.length == alice_parents.length &&
     alice_parents.length > 0
    puts "Alice and Michael are full siblings - keeping relationship"
  else
    puts "Alice and Michael are step-siblings - removing incorrect sibling relationships"
    
    # Remove the incorrect sibling relationships
    rel1 = Relationship.find_by(person: alice, relative: michael, relationship_type: 'sibling')
    rel2 = Relationship.find_by(person: michael, relative: alice, relationship_type: 'sibling')
    
    removed_count = 0
    [rel1, rel2].compact.each do |rel|
      rel.destroy
      removed_count += 1
    end
    
    puts "Removed #{removed_count} incorrect sibling relationships"
  end
else
  puts "Error: Could not find Alice or Michael"
end

# Also fix any other incorrect step-sibling relationships
puts "\n=== CHECKING ALL SIBLING RELATIONSHIPS ==="

fixed_count = 0
validated_count = 0

Relationship.where(relationship_type: 'sibling').find_each do |rel|
  person1 = rel.person
  person2 = rel.relative
  
  person1_parents = person1.parents.to_a
  person2_parents = person2.parents.to_a
  shared_parents = person1_parents & person2_parents
  
  # Check if they are actually full siblings
  if person1_parents.length == person2_parents.length && 
     shared_parents.length == person1_parents.length &&
     person1_parents.length > 0
    validated_count += 1
  else
    puts "Fixing: #{person1.first_name} #{person1.last_name} and #{person2.first_name} #{person2.last_name} are step-siblings"
    rel.destroy
    fixed_count += 1
  end
end

puts "Validated #{validated_count} correct sibling relationships"
puts "Fixed #{fixed_count} incorrect step-sibling relationships"
puts "All sibling relationships have been corrected."