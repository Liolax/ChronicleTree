# Quick check of users and authentication setup
require_relative 'config/environment'

puts "=== CHECKING USERS AND AUTHENTICATION ==="

puts "Total users: #{User.count}"
User.all.each do |user|
  people_count = user.people.count
  puts "User #{user.id}: #{user.email} (#{people_count} people)"
  
  # Show some people for context
  if people_count > 0
    sample_people = user.people.limit(3).map { |p| "#{p.first_name} #{p.last_name} (ID #{p.id})" }
    puts "  People: #{sample_people.join(', ')}"
    
    # Check if this user has person 26
    if user.people.exists?(id: 26)
      puts "  ✅ THIS USER OWNS PERSON 26"
    end
  end
end

# Check person 26 specifically
person_26 = Person.find_by(id: 26)
if person_26
  puts "\nPerson 26 details:"
  puts "  Name: #{person_26.first_name} #{person_26.last_name}"
  puts "  User ID: #{person_26.user_id}"
  puts "  Deceased: #{person_26.is_deceased}"
  puts "  Death date: #{person_26.date_of_death}"
else
  puts "\nPerson 26 not found!"
end
