# Simple test to check if person ID 26 exists and what the issue is
require_relative 'config/environment'

puts "=== CHECKING PERSON ID 26 STATUS ==="

begin
  person = Person.find(26)
  puts "Person ID 26 found:"
  puts "- Name: #{person.first_name} #{person.last_name}"
  puts "- Deceased: #{person.is_deceased}"
  puts "- Death date: #{person.date_of_death}"
  
  # Try a simple update to see what fails
  puts "\n=== TESTING SIMPLE UPDATE ==="
  begin
    person.update!(first_name: person.first_name) # No actual change
    puts "✓ Simple update successful"
  rescue => e
    puts "✗ Simple update failed: #{e.message}"
    puts e.backtrace[0..3]
  end
  
  # Test the specific update that's failing
  puts "\n=== TESTING DECEASED STATUS UPDATE ==="
  begin
    person.update!(
      date_of_death: nil,
      is_deceased: false
    )
    puts "✓ Deceased status update successful"
  rescue => e
    puts "✗ Deceased status update failed: #{e.message}"
    puts e.backtrace[0..3]
  end
  
rescue ActiveRecord::RecordNotFound
  puts "Person ID 26 not found in database"
rescue => e
  puts "Error finding person: #{e.message}"
end
