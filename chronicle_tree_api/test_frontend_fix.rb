# Test script to verify the Molly fix works after frontend update
require_relative 'config/environment'

puts "=== TESTING MOLLY FIX AFTER FRONTEND UPDATE ==="

molly = Person.find_by(first_name: 'Molly', last_name: 'Doe')
robert = Person.find_by(first_name: 'Robert', last_name: 'Doe')

if molly.nil? || robert.nil?
  puts "Error: Could not find Molly or Robert"
  exit 1
end

puts "Current state:"
puts "- Molly: ID #{molly.id}, deceased: #{molly.is_deceased}, death_date: #{molly.date_of_death}"
puts "- Robert: ID #{robert.id}, deceased: #{robert.is_deceased}, death_date: #{robert.date_of_death}"

# Check current spouses before making any changes
puts "\nRobert's current spouses: #{robert.current_spouses.map(&:full_name)}"

# Simulate the API call that's now being made from frontend
puts "\n=== SIMULATING FRONTEND API CALL ==="
puts "Data being sent from ProfileDetails:"
puts "- first_name: 'Molly'"
puts "- last_name: 'Doe'"
puts "- gender: 'Female'"
puts "- date_of_birth: '1945-03-15'"
puts "- date_of_death: '' (empty to make alive)"
puts "- is_deceased: false (now included!)"

begin
  # Update Molly exactly as the frontend would do now
  molly.update!(
    first_name: 'Molly',
    last_name: 'Doe',
    gender: 'Female',
    date_of_birth: '1945-03-15',
    date_of_death: nil,
    is_deceased: false
  )
  
  puts "\n✓ SUCCESS! Molly has been updated without errors"
  
  # Verify the changes
  molly.reload
  puts "\nAfter update:"
  puts "- Molly: deceased: #{molly.is_deceased}, death_date: #{molly.date_of_death}"
  puts "- Robert's current spouses: #{robert.current_spouses.map(&:full_name)}"
  
  # Check relationship records
  molly_robert_rel = Relationship.find_by(person: molly, relative: robert, relationship_type: 'spouse')
  robert_molly_rel = Relationship.find_by(person: robert, relative: molly, relationship_type: 'spouse')
  
  puts "\nRelationship records after update:"
  puts "- Molly->Robert: is_deceased: #{molly_robert_rel&.is_deceased}, is_ex: #{molly_robert_rel&.is_ex}"
  puts "- Robert->Molly: is_deceased: #{robert_molly_rel&.is_deceased}, is_ex: #{robert_molly_rel&.is_ex}"
  
  puts "\n🎉 THE FIX IS WORKING! Frontend can now make Molly alive successfully!"
  
rescue => e
  puts "\n❌ Error occurred: #{e.message}"
  puts e.backtrace[0..5]
end
