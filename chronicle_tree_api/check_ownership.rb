# Check ownership and user relationship for person 26
require_relative 'config/environment'

puts "=== CHECKING PERSON 26 OWNERSHIP ==="

person = Person.find_by(id: 26)
if person.nil?
  puts "Person 26 not found in database"
  exit 1
end

puts "Person 26: #{person.first_name} #{person.last_name}"
puts "User ID: #{person.user_id}"

# Check if user exists
if person.user_id
  user = User.find_by(id: person.user_id)
  if user
    puts "Owner: #{user.email}"
    puts "User created: #{user.created_at}"
  else
    puts "❌ User ID #{person.user_id} not found!"
  end
else
  puts "❌ Person has no user_id!"
end

# Check all users and their people
puts "\n=== ALL USERS AND THEIR PEOPLE ==="
User.all.each do |user|
  people_count = user.people.count
  people_names = user.people.limit(5).map { |p| "#{p.first_name} #{p.last_name} (ID #{p.id})" }
  puts "User #{user.id} (#{user.email}): #{people_count} people"
  puts "  Sample: #{people_names.join(', ')}"
  
  # Check if this user owns person 26
  if user.people.exists?(id: 26)
    puts "  ✅ This user owns person 26!"
  end
end

# Check authentication token validity
puts "\n=== CHECKING AUTHENTICATION ==="
puts "Looking for recent authentication tokens..."

# Check active sessions or tokens if available
if defined?(Devise)
  puts "Devise available - checking user sessions"
else
  puts "Devise not available in this context"
end
