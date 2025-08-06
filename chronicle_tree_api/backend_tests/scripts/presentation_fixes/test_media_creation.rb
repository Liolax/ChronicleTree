# Test media creation to debug the 500 error
require_relative '../../config/environment'

puts "=== TESTING MEDIA CREATION ==="

# Find test user and a person
user = User.find_by(email: 'test@example.com')
person = user.people.first

puts "User: #{user.email}"
puts "Person: #{person.first_name} #{person.last_name} (ID: #{person.id})"

# Test media creation
begin
  media = person.media.build(
    title: "Test Media", 
    description: "Test description for debugging"
  )
  
  # Simulate file attachment (without actual file for testing)
  if media.save
    puts "SUCCESS: Media created successfully"
    puts "  Media ID: #{media.id}"
    puts "  Title: #{media.title}"
  else
    puts "ERROR: Media creation failed"
    puts "  Errors: #{media.errors.full_messages}"
  end
rescue => e
  puts "EXCEPTION: #{e.message}"
  puts "Error class: #{e.class}"
  puts "Backtrace:"
  puts e.backtrace.first(5).join("\n")
end