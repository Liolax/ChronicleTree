# Script to investigate Molly user ownership issue
# This script will check user ownership and fix the issue

puts "=== INVESTIGATING MOLLY USER OWNERSHIP ISSUE ==="

# Check if person 26 exists and their user ownership
person_26 = Person.find_by(id: 26)
if person_26.nil?
  puts "❌ Person ID 26 not found"
  exit
end

puts "✓ Found Person 26: #{person_26.first_name} #{person_26.last_name}"
puts "  User ID: #{person_26.user_id}"
puts "  Birth: #{person_26.date_of_birth}"
puts "  Death: #{person_26.date_of_death}"

# Check all users
puts "\n=== ALL USERS ==="
User.all.each do |user|
  puts "User #{user.id}: #{user.email} (#{user.people.count} people)"
end

# Find the test user
test_user = User.find_by(email: 'test@example.com')
if test_user.nil?
  puts "❌ Test user not found"
  exit
end

puts "\n=== TEST USER INFO ==="
puts "Test User ID: #{test_user.id}"
puts "Test User People Count: #{test_user.people.count}"

# Check if person 26 belongs to test user
if person_26.user_id == test_user.id
  puts "✓ Person 26 already belongs to test user"
else
  puts "❌ Person 26 belongs to user #{person_26.user_id}, not test user #{test_user.id}"
  puts "Fixing ownership..."
  
  # Update person 26 to belong to test user
  person_26.update!(user_id: test_user.id)
  puts "✓ Fixed! Person 26 now belongs to test user"
end

# Check relationships for person 26
puts "\n=== PERSON 26 RELATIONSHIPS ==="
relationships = Relationship.where("person_id = ? OR relative_id = ?", person_26.id, person_26.id)
relationships.each do |rel|
  other_person_id = rel.person_id == person_26.id ? rel.relative_id : rel.person_id
  other_person = Person.find(other_person_id)
  
  puts "  #{rel.relationship_type} to #{other_person.first_name} #{other_person.last_name} (ID: #{other_person.id})"
  puts "    is_ex: #{rel.is_ex}, is_deceased: #{rel.is_deceased}"
  puts "    Other person user_id: #{other_person.user_id}"
  
  # Fix other person ownership if needed
  if other_person.user_id != test_user.id
    puts "    ⚠️  Fixing ownership for #{other_person.first_name} #{other_person.last_name}"
    other_person.update!(user_id: test_user.id)
    puts "    ✓ Fixed!"
  end
end

puts "\n=== SUMMARY ==="
puts "All people should now belong to test user #{test_user.id}"
puts "Person 26 (Molly) relationships fixed"