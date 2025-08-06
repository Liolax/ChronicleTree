# Debug script to understand Molly/Robert marriage issue
require_relative '../chronicle_tree_api/config/environment'

puts "=== DEBUGGING MOLLY ISSUE ==="

# Find Molly (should be ID 26 based on user error)
molly = Person.find_by(first_name: 'Molly', last_name: 'Doe')
if molly.nil?
  puts "Error: Molly not found"
  exit
end

puts "Found Molly: #{molly.first_name} #{molly.last_name} (ID: #{molly.id})"
puts "  Birth: #{molly.date_of_birth}"
puts "  Death: #{molly.date_of_death}"
puts "  Is Deceased: #{molly.is_deceased?}"

# Find Robert
robert = Person.find_by(first_name: 'Robert', last_name: 'Doe')
if robert.nil?
  puts "Error: Robert not found"
  exit
end

puts "Found Robert: #{robert.first_name} #{robert.last_name} (ID: #{robert.id})"
puts "  Birth: #{robert.date_of_birth}"
puts "  Death: #{robert.date_of_death}"
puts "  Is Deceased: #{robert.is_deceased?}"

# Check Molly's relationships
puts "\n=== MOLLY'S RELATIONSHIPS ==="
molly_rels = Relationship.where(person_id: molly.id).or(Relationship.where(relative_id: molly.id))
molly_rels.each do |rel|
  other_person = rel.person_id == molly.id ? rel.relative : rel.person
  puts "  #{rel.relationship_type} to #{other_person.first_name} #{other_person.last_name} (ID: #{other_person.id})"
  puts "    is_ex: #{rel.is_ex}, is_deceased: #{rel.is_deceased}"
end

# Check Robert's relationships
puts "\n=== ROBERT'S RELATIONSHIPS ==="
robert_rels = Relationship.where(person_id: robert.id).or(Relationship.where(relative_id: robert.id))
robert_rels.each do |rel|
  other_person = rel.person_id == robert.id ? rel.relative : rel.person
  puts "  #{rel.relationship_type} to #{other_person.first_name} #{other_person.last_name} (ID: #{other_person.id})"
  puts "    is_ex: #{rel.is_ex}, is_deceased: #{rel.is_deceased}"
end

# Test the methods
puts "\n=== TESTING METHODS ==="
puts "molly.all_spouses_including_deceased: #{molly.all_spouses_including_deceased.pluck(:first_name)}"
puts "robert.current_spouses: #{robert.current_spouses.pluck(:first_name)}"

puts "\n=== SIMULATING UPDATE ==="
puts "If we make Molly alive (set date_of_death to nil):"
puts "Robert's current spouses would be: #{robert.current_spouses.reject { |s| s.id == molly.id }.pluck(:first_name)}"

puts "\n=== TESTING UPDATE LOGIC ==="
begin
  # Simulate the controller logic
  if molly.date_of_death.present?
    puts "Molly is currently deceased"
    
    current_spouses = molly.all_spouses_including_deceased
    puts "Molly's spouses: #{current_spouses.pluck(:first_name)}"
    
    current_spouses.each do |spouse|
      puts "Checking spouse: #{spouse.first_name}"
      other_living_spouses = spouse.current_spouses.reject { |s| s.id == molly.id }
      puts "  Other living spouses: #{other_living_spouses.pluck(:first_name)}"
      
      if other_living_spouses.any?
        puts "CONFLICT: #{spouse.first_name} has other living spouses"
      else
        puts "OK: #{spouse.first_name} has no other living spouses"
      end
    end
  end
rescue => e
  puts "ERROR: #{e.message}"
  puts "Backtrace: #{e.backtrace.first(5).join("\n")}"
end
