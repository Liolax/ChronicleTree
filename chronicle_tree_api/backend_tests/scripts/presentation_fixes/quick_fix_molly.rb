# Quick Ruby script to fix Molly ownership issue
puts "=== FIXING MOLLY OWNERSHIP ISSUE ==="

# Find all users
users = User.all
puts "Found #{users.count} users:"
users.each { |u| puts "  User #{u.id}: #{u.email}" }

# Find the test user
test_user = User.find_by(email: 'test@example.com') || User.first
puts "Using test user: #{test_user.id} (#{test_user.email})"

# Update all people to belong to test user
people_updated = Person.where.not(user_id: test_user.id).count
Person.where.not(user_id: test_user.id).update_all(user_id: test_user.id)

puts "Updated #{people_updated} people to belong to test user"

# Verify Molly
molly = Person.find_by(first_name: 'Molly', last_name: 'Doe')
if molly
  puts "Molly found: ID #{molly.id}, User ID #{molly.user_id}"
  puts "Can test user access Molly? #{test_user.people.exists?(molly.id)}"
else
  puts "Molly not found"
end

puts "Fix completed!"