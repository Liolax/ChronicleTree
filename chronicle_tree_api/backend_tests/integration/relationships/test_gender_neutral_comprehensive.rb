#!/usr/bin/env ruby

require_relative '../../config/environment'
require 'net/http'
require 'json'

puts "=== Comprehensive Gender-Neutral Label Test ==="

# Test by temporarily removing gender from William (Alice's step-grandfather)
william = Person.find_by(id: 15)
alice = Person.find_by(id: 3)

original_gender = william.gender
puts "Testing with William O'Sullivan (ID: 15)"
puts "Original gender: #{original_gender}"

begin
  # Remove gender temporarily
  william.update!(gender: nil)
  puts "✓ Temporarily set William's gender to nil"
  
  # Test Alice's profile sharing
  puts "\n=== Testing Profile Share with Nil Gender ==="
  uri = URI('http://localhost:3001/api/v1/share/profile/3')
  http = Net::HTTP.new(uri.host, uri.port)
  response = http.get(uri)
  
  if response.code == '200'
    data = JSON.parse(response.body)
    puts "Profile share description: #{data['description']}"
    
    # The description should handle nil gender gracefully
    # Check if it mentions step-grandparents without assuming gender
  else
    puts "ERROR: Failed to fetch profile share: #{response.code}"
  end
  
  # Test Alice's tree sharing
  puts "\n=== Testing Tree Share with Nil Gender ==="
  uri = URI('http://localhost:3001/api/v1/share/tree/3?generations=4')
  http = Net::HTTP.new(uri.host, uri.port)
  response = http.get(uri)
  
  if response.code == '200'
    data = JSON.parse(response.body)
    puts "Tree share description: #{data['description']}"
  else
    puts "ERROR: Failed to fetch tree share: #{response.code}"
  end
  
rescue => e
  puts "ERROR: Error during test: #{e.message}"
ensure
  # Always restore original gender
  william.update!(gender: original_gender)
  puts "\n✓ Restored William's gender to: #{original_gender}"
end

puts "\n=== Testing Frontend Relationship Calculator with Nil Gender ==="
puts "The relationship calculator should handle nil gender by:"
puts "1. Using gender-neutral terms like 'Sibling', 'Parent', 'Child'"
puts "2. Falling back to generic labels when specific gender is unavailable"
puts "3. Not crashing or showing undefined/null in the UI"

# Test with multiple people
puts "\n=== Testing Multiple Gender Modifications ==="

# Test persons for gender-neutral testing
test_cases = [
  { person: Person.find_by(id: 16), role: "Alice's step-grandmother (Patricia)" },
  { person: Person.find_by(id: 17), role: "Michael's step-grandfather (Richard)" },
  { person: Person.find_by(id: 18), role: "Michael's step-grandmother (Margaret)" }
]

test_cases.each do |test_case|
  person = test_case[:person]
  role = test_case[:role]
  original = person.gender
  
  puts "\nTesting #{role}:"
  puts "  Original gender: #{original}"
  
  begin
    person.update!(gender: nil)
    puts "  ✓ Set to nil - should use gender-neutral labels"
    
    # In a real test, we would check the frontend calculation here
    # For now, we'll just document the expected behavior
    puts "  Expected: Gender-neutral relationship labels"
    
  ensure
    person.update!(gender: original)
    puts "  ✓ Restored to: #{original}"
  end
end

puts "\n=== Gender-Neutral Label Expectations ==="
puts "When gender is nil/missing, the system should display:"
puts "- 'Step-Grandparent' instead of 'Step-Grandfather'/'Step-Grandmother'"
puts "- 'Half-Sibling' instead of 'Half-Brother'/'Half-Sister'"
puts "- 'Sibling' instead of 'Brother'/'Sister'"
puts "- 'Parent' instead of 'Father'/'Mother'"
puts "- 'Child' instead of 'Son'/'Daughter'"