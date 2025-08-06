# Script to identify the correct user for person 26 and fix authentication issues
require_relative 'config/environment'

puts "=== RESOLVING PERSON 26 OWNERSHIP ISSUE ==="

# Find person 26
person = Person.find_by(id: 26)
unless person
  puts "Person 26 not found in database"
  exit 1
end

puts "Person 26: #{person.first_name} #{person.last_name}"
puts "Current user_id: #{person.user_id}"

# Find the correct user
if person.user_id
  owner = User.find_by(id: person.user_id)
  if owner
    puts "Owner: #{owner.email} (ID #{owner.id})"
  else
    puts "WARNING: Person 26 has user_id #{person.user_id} but this user doesn't exist!"
  end
else
  puts "WARNING: Person 26 has no user_id assigned!"
end

# List all users and find Molly/Robert pairs
puts "\n=== FINDING MOLLY/ROBERT PAIRS BY USER ==="
User.all.each do |user|
  mollys = user.people.where(first_name: 'Molly')
  roberts = user.people.where(first_name: 'Robert')
  
  if mollys.any? || roberts.any?
    puts "\nUser #{user.id} (#{user.email}):"
    mollys.each { |m| puts "  Molly: ID #{m.id}, deceased: #{m.is_deceased}" }
    roberts.each { |r| puts "  Robert: ID #{r.id}, deceased: #{r.is_deceased}" }
    
    # Check for marriage relationships between them
    mollys.each do |molly|
      roberts.each do |robert|
        rel = Relationship.find_by(person: molly, relative: robert, relationship_type: 'spouse')
        if rel
          puts "  ✓ Marriage: Molly #{molly.id} <-> Robert #{robert.id}"
          if molly.id == 26 || robert.id == 26
            puts "    🎯 THIS IS THE USER WHO SHOULD ACCESS PERSON 26!"
          end
        end
      end
    end
  end
end

# Check if we need to fix ownership
puts "\n=== CHECKING FOR OWNERSHIP ISSUES ==="
if person.user_id.nil?
  puts "Person 26 needs to be assigned to a user"
  
  # Find users with family tree data
  users_with_data = User.joins(:people).group('users.id').having('COUNT(people.id) > 0')
  
  if users_with_data.count == 1
    user = users_with_data.first
    puts "Only one user has people data: #{user.email}"
    puts "Assigning person 26 to this user..."
    person.update!(user_id: user.id)
    puts "✓ Person 26 now belongs to #{user.email}"
  else
    puts "Multiple users found with data. Manual assignment needed."
    users_with_data.each do |user|
      people_count = user.people.count
      puts "  User #{user.id} (#{user.email}): #{people_count} people"
    end
  end
elsif person.user_id && !User.exists?(person.user_id)
  puts "Person 26's owner (user #{person.user_id}) doesn't exist"
  puts "Need to reassign to an existing user"
end

puts "\n=== RESOLUTION COMPLETE ==="
