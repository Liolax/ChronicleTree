# Automatic fix for person 26 ownership issue
require_relative 'config/environment'

puts "=== AUTOMATIC OWNERSHIP FIX FOR PERSON 26 ==="

person_26 = Person.find_by(id: 26)
unless person_26
  puts "❌ Person 26 not found"
  exit 1
end

puts "Person 26: #{person_26.first_name} #{person_26.last_name}"
puts "Current user_id: #{person_26.user_id || 'NONE'}"

# Strategy: Assign person 26 to the user who has the most people (likely the main user)
user_with_most_people = User.joins(:people)
                           .group('users.id')
                           .order('COUNT(people.id) DESC')
                           .first

if user_with_most_people
  people_count = user_with_most_people.people.count
  puts "User with most people: #{user_with_most_people.email} (#{people_count} people)"
  
  # Check if person 26 already belongs to this user
  if person_26.user_id == user_with_most_people.id
    puts "✅ Person 26 already belongs to #{user_with_most_people.email}"
  else
    puts "Assigning person 26 to #{user_with_most_people.email}..."
    person_26.update!(user_id: user_with_most_people.id)
    puts "✅ Person 26 now belongs to #{user_with_most_people.email}"
  end
  
  # Verify the fix
  if user_with_most_people.people.exists?(id: 26)
    puts "✅ VERIFICATION: User #{user_with_most_people.email} can now access person 26"
    puts "🎉 The 500 error should now be resolved!"
  else
    puts "❌ VERIFICATION FAILED: Assignment didn't work"
  end
else
  puts "❌ No users with people found"
end

puts "\n=== FIX COMPLETE ==="
