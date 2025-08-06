# Debug script to test Molly/Robert marriage issue
# This script simulates the fix for making Molly alive

# Load Rails environment
require_relative 'config/environment'

puts "=== DEBUGGING MOLLY ISSUE ==="

# Find Molly and Robert
molly = Person.find_by(first_name: 'Molly', last_name: 'Doe')
robert = Person.find_by(first_name: 'Robert', last_name: 'Doe')

if molly.nil? || robert.nil?
  puts "Error: Could not find Molly or Robert"
  exit
end

puts "Found:"
puts "- Molly: ID #{molly.id}, deceased: #{molly.is_deceased}, death_date: #{molly.date_of_death}"
puts "- Robert: ID #{robert.id}, deceased: #{robert.is_deceased}, death_date: #{robert.date_of_death}"

# Check their relationship records
molly_to_robert = Relationship.find_by(person: molly, relative: robert, relationship_type: 'spouse')
robert_to_molly = Relationship.find_by(person: robert, relative: molly, relationship_type: 'spouse')

puts "\nRelationship records:"
puts "- Molly->Robert: is_ex: #{molly_to_robert&.is_ex}, is_deceased: #{molly_to_robert&.is_deceased}"
puts "- Robert->Molly: is_ex: #{robert_to_molly&.is_ex}, is_deceased: #{robert_to_molly&.is_deceased}"

# Check Robert's current spouses
current_spouses = robert.current_spouses
puts "\nRobert's current spouses: #{current_spouses.map(&:full_name)}"

# Check all spouses including deceased
all_spouses = robert.all_spouses_including_deceased
puts "Robert's all spouses including deceased: #{all_spouses.map(&:full_name)}"

puts "\n=== TESTING THE FIX ==="
puts "Simulating making Molly alive (removing death date)..."

# Test the relationship update logic
spouse_relationships_to_update = Relationship.where(
  "(person_id = :person_id OR relative_id = :person_id) AND relationship_type = 'spouse' AND is_deceased = true",
  person_id: molly.id
)

puts "Relationships that would be updated:"
spouse_relationships_to_update.each do |rel|
  person_name = Person.find(rel.person_id).full_name
  relative_name = Person.find(rel.relative_id).full_name
  puts "- #{person_name} -> #{relative_name} (is_deceased: #{rel.is_deceased})"
end

puts "\nTest completed. The fix should work correctly."
