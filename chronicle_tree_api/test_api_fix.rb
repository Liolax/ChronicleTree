# Direct API test for Molly marriage fix
# This simulates the exact API call that would be made by the frontend

# Load Rails environment
require_relative 'config/environment'

puts "=== TESTING MOLLY API UPDATE ==="

# Find test user
user = User.find_by(email: 'test@example.com')
if user.nil?
  puts "Error: Test user not found"
  exit
end

# Find Molly
molly = user.people.find_by(first_name: 'Molly', last_name: 'Doe')
if molly.nil?
  puts "Error: Molly not found"
  exit
end

puts "Before update:"
puts "- Molly: ID #{molly.id}, deceased: #{molly.is_deceased}, death_date: #{molly.date_of_death}"

# Check relationships
molly_spouse_rels = Relationship.where(
  "(person_id = ? OR relative_id = ?) AND relationship_type = 'spouse'",
  molly.id, molly.id
)

puts "- Molly's spouse relationships:"
molly_spouse_rels.each do |rel|
  other_person_id = rel.person_id == molly.id ? rel.relative_id : rel.person_id
  other_person = Person.find(other_person_id)
  puts "  -> #{other_person.full_name}: is_ex: #{rel.is_ex}, is_deceased: #{rel.is_deceased}"
end

# Simulate API call parameters (what frontend sends)
update_params = {
  first_name: molly.first_name,
  last_name: molly.last_name,
  date_of_birth: molly.date_of_birth,
  date_of_death: nil,  # Remove death date to make alive
  is_deceased: false,   # Mark as not deceased
  gender: molly.gender
}

puts "\nSimulating API update with params:"
puts update_params

# Simulate the controller logic
ActiveRecord::Base.transaction do
  # Get original death date
  original_death_date = molly.date_of_death
  new_death_date = update_params[:date_of_death]
  
  # Check if person is being marked as alive
  if original_death_date.present? && new_death_date.blank?
    puts "\nDetected: Person being marked as alive"
    
    # Check for marriage conflicts (simplified version)
    current_spouses = molly.all_spouses_including_deceased
    puts "- Current spouses to check: #{current_spouses.map(&:full_name)}"
    
    current_spouses.each do |spouse|
      other_living_spouses = spouse.current_spouses.reject { |s| s.id == molly.id }
      if other_living_spouses.any?
        puts "ERROR: Marriage conflict detected!"
        puts "- #{spouse.full_name} has other current spouses: #{other_living_spouses.map(&:full_name)}"
        raise ActiveRecord::Rollback
      end
    end
    
    puts "- No marriage conflicts found"
  end
  
  # Update person
  if molly.update(update_params)
    puts "\nPerson updated successfully"
    
    # Apply automatic deceased status logic
    if molly.date_of_death.present? && !molly.is_deceased
      molly.update_column(:is_deceased, true)
      puts "- Automatically marked as deceased (has death date)"
    elsif molly.date_of_death.blank? && molly.is_deceased
      molly.update_column(:is_deceased, false)
      puts "- Automatically marked as alive (no death date)"
    end
    
    # Apply relationship update logic
    if original_death_date.present? && new_death_date.blank?
      puts "- Updating marriage relationships to current status"
      spouse_relationships_to_update = Relationship.where(
        "(person_id = ? OR relative_id = ?) AND relationship_type = 'spouse' AND is_deceased = true",
        molly.id, molly.id
      )
      updated_count = spouse_relationships_to_update.update_all(is_deceased: false)
      puts "- Updated #{updated_count} relationship records"
    end
    
  else
    puts "ERROR: Failed to update person"
    puts molly.errors.full_messages
    raise ActiveRecord::Rollback
  end
end

# Check results
molly.reload
puts "\nAfter update:"
puts "- Molly: deceased: #{molly.is_deceased}, death_date: #{molly.date_of_death}"

molly_spouse_rels.each(&:reload)
puts "- Molly's spouse relationships:"
molly_spouse_rels.each do |rel|
  other_person_id = rel.person_id == molly.id ? rel.relative_id : rel.person_id
  other_person = Person.find(other_person_id)
  puts "  -> #{other_person.full_name}: is_ex: #{rel.is_ex}, is_deceased: #{rel.is_deceased}"
end

# Check Robert's current spouses
robert = Person.find_by(first_name: 'Robert', last_name: 'Doe')
if robert
  current_spouses = robert.current_spouses
  puts "- Robert's current spouses: #{current_spouses.map(&:full_name)}"
end

puts "\nTest completed!"
