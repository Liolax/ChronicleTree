# Fix incorrect sibling relationships - remove step-sibling relationships that were created as full siblings

puts "=== FIXING INCORRECT SIBLING RELATIONSHIPS ==="

# Find Alice and Michael
alice = Person.find_by(first_name: 'Alice', last_name: 'Doe')
michael = Person.find_by(first_name: 'Michael', last_name: 'Doe')

if alice && michael
  puts "Found Alice (#{alice.id}) and Michael (#{michael.id})"
  
  # Check their parents
  alice_parents = alice.parents.to_a
  michael_parents = michael.parents.to_a
  shared_parents = alice_parents & michael_parents
  
  puts "Alice's parents: #{alice_parents.map { |p| "#{p.first_name} #{p.last_name}" }}"
  puts "Michael's parents: #{michael_parents.map { |p| "#{p.first_name} #{p.last_name}" }}"
  puts "Shared parents: #{shared_parents.map { |p| "#{p.first_name} #{p.last_name}" }}"
  
  # Check if they are full siblings or step-siblings
  if alice_parents.length == michael_parents.length && 
     shared_parents.length == alice_parents.length &&
     alice_parents.length > 0
    puts "They are FULL siblings - keeping sibling relationship"
  else
    puts "They are STEP-siblings - removing incorrect sibling relationships"
    
    # Remove the incorrect sibling relationships
    rel1 = Relationship.find_by(person: alice, relative: michael, relationship_type: 'sibling')
    rel2 = Relationship.find_by(person: michael, relative: alice, relationship_type: 'sibling')
    
    if rel1
      puts "Removing Alice -> Michael sibling relationship (ID: #{rel1.id})"
      rel1.destroy
    end
    
    if rel2
      puts "Removing Michael -> Alice sibling relationship (ID: #{rel2.id})"
      rel2.destroy
    end
    
    puts "Step-sibling relationships removed. The relationship calculator will now detect them as step-siblings."
  end
else
  puts "Could not find Alice or Michael"
end

# Also fix any other incorrect step-sibling relationships
puts "\n=== CHECKING ALL SIBLING RELATIONSHIPS ==="
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
    puts "✓ #{person1.first_name} #{person1.last_name} and #{person2.first_name} #{person2.last_name} are FULL siblings"
  else
    puts "✗ #{person1.first_name} #{person1.last_name} and #{person2.first_name} #{person2.last_name} are STEP-siblings - removing relationship (ID: #{rel.id})"
    rel.destroy
  end
end

puts "\nDone! All incorrect sibling relationships have been fixed."