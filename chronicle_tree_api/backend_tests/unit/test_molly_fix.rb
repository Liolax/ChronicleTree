# Test fix for Molly/Robert marriage issue using Rails runner
require_relative '../chronicle_tree_api/config/environment'

puts "=== Testing Deceased Spouse Marriage Fix ==="

# Find Molly and Robert
molly = Person.find_by(first_name: 'Molly', last_name: 'Doe')
robert = Person.find_by(first_name: 'Robert', last_name: 'Doe')

if molly.nil? || robert.nil?
  puts "Error: Could not find Molly or Robert in database"
  puts "Available people:"
  Person.all.each { |p| puts "- #{p.full_name} (ID: #{p.id})" }
  exit
end

puts "Before fix:"
puts "- Molly: ID #{molly.id}, deceased: #{molly.is_deceased}"
puts "- Robert: ID #{robert.id}, deceased: #{robert.is_deceased}"

# Check relationship status
molly_robert_rel = Relationship.find_by(person: molly, relative: robert, relationship_type: 'spouse')
robert_molly_rel = Relationship.find_by(person: robert, relative: molly, relationship_type: 'spouse')

puts "- Molly->Robert relationship is_deceased: #{molly_robert_rel&.is_deceased}"
puts "- Robert->Molly relationship is_deceased: #{robert_molly_rel&.is_deceased}"
puts "- Robert's current spouses: #{robert.current_spouses.map(&:full_name)}"

# Test the fix: Make Molly alive
puts "\nApplying fix: Making Molly alive..."

# Update Molly's status
molly.update!(date_of_death: nil, is_deceased: false)

# Update relationship records (the fix)
spouse_relationships = Relationship.where(
  "(person_id = ? OR relative_id = ?) AND relationship_type = 'spouse' AND is_deceased = true",
  molly.id, molly.id
)

puts "Updating #{spouse_relationships.count} relationship records..."
spouse_relationships.update_all(is_deceased: false)

# Reload and check results
molly.reload
robert.reload
molly_robert_rel&.reload
robert_molly_rel&.reload

puts "\nAfter fix:"
puts "- Molly: deceased: #{molly.is_deceased}, death_date: #{molly.date_of_death}"
puts "- Molly->Robert relationship is_deceased: #{molly_robert_rel&.is_deceased}"
puts "- Robert->Molly relationship is_deceased: #{robert_molly_rel&.is_deceased}"
puts "- Robert's current spouses: #{robert.current_spouses.map(&:full_name)}"

puts "\nFix completed successfully! Molly should now appear as Robert's current spouse."
