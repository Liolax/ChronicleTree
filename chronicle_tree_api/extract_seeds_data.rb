# Rails Console Helper Script
# Copy and paste this in the Rails console to extract real seed data

puts "=== CHRONICLE TREE DATA EXTRACTION ==="
puts "Getting all people and relationships from the database..."
puts

# Get all people
people = Person.all
puts "Found #{people.count} people:"
people.each do |person|
  puts "  #{person.id}: #{person.full_name} (#{person.gender}, born #{person.date_of_birth})"
end
puts

# Get all relationships
relationships = Relationship.all
puts "Found #{relationships.count} relationships:"
relationships.each do |rel|
  person_name = rel.person.full_name
  relative_name = rel.relative.full_name
  puts "  #{rel.id}: #{person_name} --[#{rel.relationship_type}#{rel.is_ex ? ' (ex)' : ''}]--> #{relative_name}"
end
puts

# Generate API response format
puts "=== API RESPONSE FORMAT ==="
puts "// Copy this data to test frontend:"
puts
puts "const realAPIData = {"
puts "  nodes: ["

people.each_with_index do |person, index|
  comma = index < people.count - 1 ? "," : ""
  puts "    {"
  puts "      id: #{person.id},"
  puts "      first_name: \"#{person.first_name}\","
  puts "      last_name: \"#{person.last_name}\","
  puts "      full_name: \"#{person.full_name}\","
  puts "      gender: \"#{person.gender}\","
  puts "      date_of_birth: \"#{person.date_of_birth}\","
  puts "      date_of_death: #{person.date_of_death ? "\"#{person.date_of_death}\"" : "null"},"
  puts "      is_alive: #{person.is_alive}"
  puts "    }#{comma}"
end

puts "  ],"
puts "  edges: ["

relationships.each_with_index do |rel, index|
  comma = index < relationships.count - 1 ? "," : ""
  puts "    {"
  puts "      source: #{rel.person_id},"
  puts "      target: #{rel.relative_id},"
  puts "      relationship_type: \"#{rel.relationship_type}\","
  puts "      is_ex: #{rel.is_ex}"
  puts "    }#{comma}"
end

puts "  ]"
puts "};"
puts

# Test specific relationships
puts "=== RELATIONSHIP TESTS ==="
alice = Person.find_by(first_name: 'Alice', last_name: 'A')
charlie = Person.find_by(first_name: 'Charlie', last_name: 'C')

if alice && charlie
  puts "Alice: #{alice.full_name} (ID: #{alice.id})"
  puts "Charlie: #{charlie.full_name} (ID: #{charlie.id})"
  
  # Check if they're siblings
  alice_siblings = alice.relationships.where(relationship_type: 'sibling')
  charlie_siblings = charlie.relationships.where(relationship_type: 'sibling')
  
  puts "Alice's siblings:"
  alice_siblings.each do |rel|
    puts "  #{rel.relative.full_name} (ID: #{rel.relative.id})"
  end
  
  puts "Charlie's siblings:"
  charlie_siblings.each do |rel|
    puts "  #{rel.relative.full_name} (ID: #{rel.relative.id})"
  end
  
  # Check shared parents
  alice_parents = alice.relationships.where(relationship_type: 'parent').map(&:relative)
  charlie_parents = charlie.relationships.where(relationship_type: 'parent').map(&:relative)
  
  puts "Alice's parents: #{alice_parents.map(&:full_name).join(', ')}"
  puts "Charlie's parents: #{charlie_parents.map(&:full_name).join(', ')}"
  
  shared_parents = alice_parents & charlie_parents
  puts "Shared parents: #{shared_parents.map(&:full_name).join(', ')}"
  
  if shared_parents.any?
    puts "✅ Alice and Charlie are siblings (shared parents: #{shared_parents.map(&:full_name).join(', ')})"
  else
    puts "❌ Alice and Charlie do not share parents"
  end
else
  puts "❌ Could not find Alice or Charlie in the database"
end
puts

puts "=== RELATIONSHIP TESTING COMPLETE ==="
puts "You can now copy the generated API data above to test the frontend!"
