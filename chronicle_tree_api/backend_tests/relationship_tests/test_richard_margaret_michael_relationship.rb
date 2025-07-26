#!/usr/bin/env ruby
# Test script to verify relationship calculation between Richard Sharma, Margaret Sharma, and Michael Doe
# Expected: Both should be "Unrelated" to Michael since Jane Doe died in 2022 before Michael was born in 2024

require_relative '../../config/environment'

puts "Testing relationship calculation for Richard Sharma, Margaret Sharma, and Michael Doe"
puts "=" * 80

# Find the test users (assuming they were created by seeds)
begin
  richard = Person.find_by(first_name: 'Richard', last_name: 'Sharma')
  margaret = Person.find_by(first_name: 'Margaret', last_name: 'Sharma')  
  michael = Person.find_by(first_name: 'Michael', last_name: 'Doe')
  jane = Person.find_by(first_name: 'Jane', last_name: 'Doe')
  john = Person.find_by(first_name: 'John', last_name: 'Doe')
  
  if !richard || !margaret || !michael || !jane || !john
    puts "❌ ERROR: Could not find required people in database"
    puts "Richard found: #{!!richard}"
    puts "Margaret found: #{!!margaret}"
    puts "Michael found: #{!!michael}"
    puts "Jane found: #{!!jane}"
    puts "John found: #{!!john}"
    exit 1
  end
  
  puts "✅ Found all required people:"
  puts "  Richard Sharma (ID: #{richard.id}, DOB: #{richard.date_of_birth})"
  puts "  Margaret Sharma (ID: #{margaret.id}, DOB: #{margaret.date_of_birth})" 
  puts "  Michael Doe (ID: #{michael.id}, DOB: #{michael.date_of_birth})"
  puts "  Jane Doe (ID: #{jane.id}, DOB: #{jane.date_of_birth}, DOD: #{jane.date_of_death})"
  puts "  John Doe (ID: #{john.id}, DOB: #{john.date_of_birth})"
  puts

  puts "Relationship Analysis:"
  puts "=" * 50
  
  # Check timeline validation
  puts "Timeline Check:"
  puts "  Jane died: #{jane.date_of_death} (2022-01-01)" 
  puts "  Michael born: #{michael.date_of_birth} (2024-08-15)"
  puts "  Gap: #{((michael.date_of_birth - jane.date_of_death) / 365.25).round(1)} years after Jane's death"
  puts

  # Check relationships using BloodRelationshipDetector
  puts "Blood Relationship Check:"
  
  richard_michael_blood = BloodRelationshipDetector.blood_related?(richard, michael)
  margaret_michael_blood = BloodRelationshipDetector.blood_related?(margaret, michael)
  
  puts "  Richard → Michael blood related: #{richard_michael_blood}"
  puts "  Margaret → Michael blood related: #{margaret_michael_blood}"
  
  if richard_michael_blood
    desc = BloodRelationshipDetector.new(richard, michael).relationship_description
    puts "    Relationship: #{desc}"
  end
  
  if margaret_michael_blood
    desc = BloodRelationshipDetector.new(margaret, michael).relationship_description
    puts "    Relationship: #{desc}"
  end
  puts

  # Check direct relationship paths
  puts "Relationship Path Analysis:"
  
  # Richard → Jane → John → Michael path
  richard_jane_rel = Relationship.where(
    "(person_id = ? AND relative_id = ?) OR (person_id = ? AND relative_id = ?)",
    richard.id, jane.id, jane.id, richard.id
  ).where(relationship_type: ['parent', 'child'])
  
  jane_john_rel = Relationship.where(
    "(person_id = ? AND relative_id = ?) OR (person_id = ? AND relative_id = ?)",
    jane.id, john.id, john.id, jane.id
  ).where(relationship_type: 'spouse')
  
  john_michael_rel = Relationship.where(
    "(person_id = ? AND relative_id = ?) OR (person_id = ? AND relative_id = ?)",
    john.id, michael.id, michael.id, john.id
  ).where(relationship_type: ['parent', 'child'])
  
  puts "  Richard ↔ Jane relationships: #{richard_jane_rel.map(&:relationship_type).join(', ')}"
  puts "  Jane ↔ John relationships: #{jane_john_rel.map(&:relationship_type).join(', ')}"
  puts "  John ↔ Michael relationships: #{john_michael_rel.map(&:relationship_type).join(', ')}"
  puts

  # Test what the frontend relationship calculator would return
  puts "Frontend Relationship Calculator Test:"
  puts "=" * 50
  
  # Get all people and relationships for the calculation
  all_people = Person.all.to_a
  all_relationships = Relationship.all.to_a
  
  # Convert to frontend format
  frontend_relationships = all_relationships.map do |rel|
    {
      source: rel.person_id,
      target: rel.relative_id, 
      type: rel.relationship_type,
      is_ex: rel.is_ex || false,
      is_deceased: rel.is_deceased || false
    }
  end
  
  puts "Total people: #{all_people.count}"
  puts "Total relationships: #{frontend_relationships.count}"
  puts

  # Mock the frontend calculation (simplified version)
  # We need to simulate what the JavaScript calculateRelationshipToRoot would return
  
  puts "Expected Results:"
  puts "=" * 20
  puts "❓ Richard Sharma → Michael Doe: Should be 'Unrelated'"
  puts "   Reason: Jane (connecting person) died before Michael was born"
  puts "❓ Margaret Sharma → Michael Doe: Should be 'Unrelated'"  
  puts "   Reason: Jane (connecting person) died before Michael was born"
  puts

  puts "Key Timeline Points:"
  puts "- Richard and Margaret are parents of Jane Doe (1972-2022)" 
  puts "- Jane married John Doe and died in 2022"
  puts "- John later married Lisa and had Michael in 2024"
  puts "- Since Jane died before Michael was born, Richard and Margaret have no relationship to Michael"
  puts "- The connecting link (Jane) is broken by death occurring before Michael's birth"
  
rescue => e
  puts "❌ ERROR: #{e.message}"
  puts e.backtrace.first(5)
end