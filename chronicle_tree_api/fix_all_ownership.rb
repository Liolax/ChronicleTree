# Comprehensive fix to assign all people to test@example.com user
require_relative 'config/environment'

puts "=== ASSIGNING ALL PEOPLE TO test@example.com USER ==="

# Find or create the test user
test_user = User.find_by(email: 'test@example.com')

if test_user.nil?
  puts "Creating test@example.com user..."
  test_user = User.create!(
    email: 'test@example.com',
    password: 'Password123!',
    password_confirmation: 'Password123!'
  )
  puts "User created successfully: #{test_user.email}"
else
  puts "Found existing user: #{test_user.email}"
end

# Get all people and their current ownership
total_people = Person.count
people_without_user = Person.where(user_id: nil).count
people_with_other_users = Person.where.not(user_id: [nil, test_user.id]).count
people_already_owned = Person.where(user_id: test_user.id).count

puts "\nCurrent ownership status:"
puts "- Total people: #{total_people}"
puts "- Already owned by #{test_user.email}: #{people_already_owned}"
puts "- Without user assignment: #{people_without_user}"
puts "- Owned by other users: #{people_with_other_users}"

# Check specifically for person 26
person_26 = Person.find_by(id: 26)
if person_26
  puts "\nPerson 26 status:"
  puts "- Name: #{person_26.first_name} #{person_26.last_name}"
  puts "- Current user_id: #{person_26.user_id || 'NONE'}"
  puts "- Deceased: #{person_26.is_deceased}"
  puts "- Death date: #{person_26.date_of_death}"
else
  puts "\nPerson 26 not found in database!"
end

# Assign all people to test user
puts "\n=== ASSIGNING ALL PEOPLE TO #{test_user.email} ==="

begin
  # Update all people to belong to test user
  updated_count = Person.update_all(user_id: test_user.id)
  puts "Successfully assigned #{updated_count} people to #{test_user.email}"
  
  # Verify person 26 specifically
  person_26&.reload
  if person_26 && person_26.user_id == test_user.id
    puts "Verified: Person 26 (#{person_26.first_name} #{person_26.last_name}) now belongs to #{test_user.email}"
  end
  
  # Show final statistics
  final_count = test_user.people.count
  puts "\nFinal result:"
  puts "- #{test_user.email} now owns #{final_count} people"
  puts "- All family tree data is now consolidated under one user"
  
  # Test authentication scope
  puts "\n=== TESTING ACCESS ==="
  if test_user.people.exists?(id: 26)
    puts "SUCCESS: #{test_user.email} can now access person 26"
    puts "The 500 error should be resolved when logged in as #{test_user.email}"
  else
    puts "ERROR: Assignment verification failed"
  end
  
rescue => e
  puts "ERROR during assignment: #{e.message}"
  puts e.backtrace[0..3]
end

puts "\n=== OWNERSHIP FIX COMPLETE ==="
puts "Next steps:"
puts "1. Ensure you are logged in as test@example.com"
puts "2. Try updating person 26 again"
puts "3. The 500 error should now be resolved"
