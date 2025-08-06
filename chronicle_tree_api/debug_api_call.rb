# Debug script to specifically test the exact API call that's failing
require_relative 'config/environment'

puts "=== DEBUGGING EXACT API CALL FAILURE ==="

# Find person 26
person = Person.find_by(id: 26)
unless person
  puts "Person ID 26 not found!"
  exit 1
end

puts "Testing person: #{person.first_name} #{person.last_name} (ID #{person.id})"
puts "Current status: deceased=#{person.is_deceased}, death_date=#{person.date_of_death}"

# Simulate the exact parameters being sent from frontend
params = {
  person: {
    first_name: person.first_name,
    last_name: person.last_name,
    gender: person.gender,
    date_of_birth: person.date_of_birth.to_s,
    date_of_death: "", # Empty string to make alive
    is_deceased: false
  }
}

puts "\nSimulating API call with params:"
puts params.inspect

# Test the controller logic step by step
begin
  puts "\n=== TESTING CONTROLLER LOGIC ==="
  
  # Step 1: Parameter validation
  new_death_date = params[:person][:date_of_death]
  puts "1. Death date parameter: '#{new_death_date}' (#{new_death_date.class})"
  
  # Step 2: Check if person is being marked as alive
  is_being_made_alive = person.date_of_death.present? && new_death_date.blank?
  puts "2. Is being made alive: #{is_being_made_alive}"
  
  if is_being_made_alive
    puts "3. Checking marriage conflicts..."
    
    # Step 3: Get current spouses
    current_spouses = person.all_spouses_including_deceased
    puts "   Current spouses: #{current_spouses.map(&:full_name)}"
    
    # Step 4: Check each spouse for conflicts
    current_spouses.each do |spouse|
      puts "   Checking spouse: #{spouse.full_name} (ID #{spouse.id})"
      
      # Check if spouse has other living current spouses (excluding this person)
      other_living_spouses = spouse.current_spouses.reject { |s| s.id == person.id }
      puts "   Other living spouses: #{other_living_spouses.map(&:full_name)}"
      
      if other_living_spouses.any?
        spouse_names = other_living_spouses.map(&:full_name).join(', ')
        error_msg = "Cannot mark #{person.first_name} #{person.last_name} as alive. Their spouse #{spouse.full_name} already has a current marriage with #{spouse_names}. A person can only have one current spouse at a time."
        puts "   ✗ CONFLICT DETECTED: #{error_msg}"
        raise error_msg
      else
        puts "   ✓ No conflicts with #{spouse.full_name}"
      end
    end
    
    puts "4. Updating relationship records..."
    # Step 5: Update relationship records
    spouse_relationships_to_update = Relationship.where(
      "(person_id = :person_id OR relative_id = :person_id) AND relationship_type = 'spouse' AND is_deceased = true",
      person_id: person.id
    )
    puts "   Found #{spouse_relationships_to_update.count} relationships to update"
    spouse_relationships_to_update.each do |rel|
      puts "   - Updating relationship: Person #{rel.person_id} <-> Person #{rel.relative_id}"
    end
  end
  
  # Step 6: Test the actual update
  puts "5. Testing person update..."
  person.assign_attributes(
    first_name: params[:person][:first_name],
    last_name: params[:person][:last_name],
    gender: params[:person][:gender],
    date_of_birth: params[:person][:date_of_birth],
    date_of_death: params[:person][:date_of_death].blank? ? nil : params[:person][:date_of_death],
    is_deceased: params[:person][:is_deceased]
  )
  
  if person.valid?
    puts "   ✓ Person attributes are valid"
    person.save!
    puts "   ✓ Person updated successfully!"
    
    # Update relationship records if needed
    if is_being_made_alive
      spouse_relationships_to_update.update_all(is_deceased: false)
      puts "   ✓ Relationship records updated"
    end
    
    puts "\n🎉 SUCCESS! The update should work without errors."
  else
    puts "   ✗ Person validation failed:"
    person.errors.full_messages.each { |msg| puts "     - #{msg}" }
  end
  
rescue => e
  puts "\n❌ ERROR OCCURRED:"
  puts "Message: #{e.message}"
  puts "Type: #{e.class}"
  puts "Backtrace:"
  puts e.backtrace[0..5]
end
