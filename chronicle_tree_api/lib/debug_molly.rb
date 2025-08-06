# Debug script to understand Molly/Robert marriage issue
puts "=== DEBUGGING MOLLY ISSUE ==="

# First check if person ID 26 exists
person_26 = Person.find_by(id: 26)
if person_26.nil?
  puts "❌ Person ID 26 not found"
else
  puts "✓ Person ID 26: #{person_26.first_name} #{person_26.last_name}"
  puts "  Birth: #{person_26.date_of_birth}"
  puts "  Death: #{person_26.date_of_death}"
  puts "  User: #{person_26.user_id}"
end

# Find Molly by name
molly = Person.find_by(first_name: 'Molly', last_name: 'Doe')
if molly.nil?
  puts "❌ Molly not found by name"
else
  puts "✓ Found Molly: #{molly.first_name} #{molly.last_name} (ID: #{molly.id})"
  puts "  Birth: #{molly.date_of_birth}"
  puts "  Death: #{molly.date_of_death}"
  puts "  User: #{molly.user_id}"
end

# Check if person 26 IS Molly
if person_26 && molly && person_26.id == molly.id
  puts "✓ Person ID 26 IS Molly"
else
  puts "❌ Person ID 26 is NOT Molly"
end

# Find Robert
robert = Person.find_by(first_name: 'Robert', last_name: 'Doe')
if robert.nil?
  puts "❌ Robert not found"
else
  puts "✓ Found Robert: #{robert.first_name} #{robert.last_name} (ID: #{robert.id})"
  puts "  Birth: #{robert.date_of_birth}"
  puts "  Death: #{robert.date_of_death}"
  puts "  User: #{robert.user_id}"
end

# Check users
puts "\n=== USER CHECK ==="
users = User.all
users.each do |user|
  puts "User #{user.id}: #{user.email}"
end

# If we have person 26, check their relationships
if person_26
  puts "\n=== PERSON 26 RELATIONSHIPS ==="
  person_26_rels = Relationship.where(person_id: person_26.id).or(Relationship.where(relative_id: person_26.id))
  person_26_rels.each do |rel|
    other_person = rel.person_id == person_26.id ? rel.relative : rel.person
    puts "  #{rel.relationship_type} to #{other_person.first_name} #{other_person.last_name} (ID: #{other_person.id})"
    puts "    is_ex: #{rel.is_ex}, is_deceased: #{rel.is_deceased}"
  end
end

puts "\n=== TESTING CONTROLLER LOGIC ==="
if person_26
  begin
    # Simulate what the controller does
    puts "Testing set_person logic..."
    test_user = User.first
    person_from_controller = test_user.people.find(person_26.id)
    puts "✓ Person found via user.people.find: #{person_from_controller.first_name}"
  rescue ActiveRecord::RecordNotFound => e
    puts "❌ RecordNotFound error: #{e.message}"
    puts "Person 26 user_id: #{person_26.user_id}"
    puts "Test user ID: #{test_user.id}"
    puts "Person belongs to user?: #{person_26.user_id == test_user.id}"
  rescue => e
    puts "❌ Other error: #{e.message}"
    puts "Error class: #{e.class}"
  end
end