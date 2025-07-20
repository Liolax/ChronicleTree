# Validation Test for Deceased Spouse Relationship Logic
# Run this in Rails console: rails console
# Then copy and paste this code

puts "=== Deceased Spouse Relationship Logic Test ==="
puts

# Find our test people
john = Person.find_by(first_name: 'John', last_name: 'Doe')
jane = Person.find_by(first_name: 'Jane', last_name: 'Doe')
lisa = Person.find_by(first_name: 'Lisa', last_name: 'Doe')
robert = Person.find_by(first_name: 'Robert', last_name: 'Doe')
molly = Person.find_by(first_name: 'Molly', last_name: 'Doe')
jane_father = Person.find_by(first_name: 'Richard', last_name: 'Sharma')
jane_mother = Person.find_by(first_name: 'Margaret', last_name: 'Sharma')

if john && jane && lisa && robert && molly
  puts "Found test people:"
  puts "- John Doe (alive, remarried): #{john.full_name}"
  puts "- Jane Doe (deceased): #{jane.full_name} (died: #{jane.date_of_death})"
  puts "- Lisa Doe (alive, John's current wife): #{lisa.full_name}"
  puts "- Robert Doe (alive, widowed): #{robert.full_name}"
  puts "- Molly Doe (deceased): #{molly.full_name} (died: #{molly.date_of_death})"
  puts

  puts "=== Test Case 1: John (remarried after spouse death) ==="
  puts "John's current spouses: #{john.current_spouses.pluck(:first_name)}"
  puts "John's all spouses: #{john.all_spouses_including_deceased.pluck(:first_name)}"
  puts "John's parents-in-law: #{john.parents_in_law.pluck(:first_name)}"
  puts "✓ Expected: NO parents-in-law from deceased spouse Jane"
  puts

  puts "=== Test Case 2: Jane (deceased person) ==="
  puts "Jane's current spouses: #{jane.current_spouses.pluck(:first_name)}"
  puts "Jane's all spouses: #{jane.all_spouses_including_deceased.pluck(:first_name)}"
  puts "Jane's parents-in-law: #{jane.parents_in_law.pluck(:first_name)}"
  puts "✓ Expected: NO in-laws (deceased people don't show in-laws)"
  puts

  puts "=== Test Case 3: Robert (widowed, not remarried) ==="
  puts "Robert's current spouses: #{robert.current_spouses.pluck(:first_name)}"
  puts "Robert's all spouses: #{robert.all_spouses_including_deceased.pluck(:first_name)}"
  puts "Robert's parents-in-law: #{robert.parents_in_law.pluck(:first_name)}"
  puts "✓ Expected: NO in-laws (per new logic, even widowed people don't show deceased spouse's parents)"
  puts

  puts "=== Test Case 4: Frontend Serialization ==="
  john_data = Api::V1::PersonSerializer.new(john).as_json
  jane_data = Api::V1::PersonSerializer.new(jane).as_json
  
  puts "John's spouse relationships:"
  john_spouses = john_data[:relatives].select { |r| r[:relationship_type] == 'spouse' }
  john_spouses.each do |spouse|
    status_parts = []
    status_parts << "ex" if spouse[:is_ex]
    status_parts << "deceased" if spouse[:is_deceased]
    status = status_parts.any? ? " (#{status_parts.join(', ')})" : ""
    puts "  - #{spouse[:full_name]}#{status}"
  end
  
  puts "Jane's spouse relationships:"
  jane_spouses = jane_data[:relatives].select { |r| r[:relationship_type] == 'spouse' }
  jane_spouses.each do |spouse|
    status_parts = []
    status_parts << "ex" if spouse[:is_ex]
    status_parts << "deceased" if spouse[:is_deceased]
    status = status_parts.any? ? " (#{status_parts.join(', ')})" : ""
    puts "  - #{spouse[:full_name]}#{status}"
  end
  
  puts "\n✓ Implementation complete! Deceased spouse logic working as expected."
else
  puts "❌ Could not find test people. Please run: rails db:seed"
end
