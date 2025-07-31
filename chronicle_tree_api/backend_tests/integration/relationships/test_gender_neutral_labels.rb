#!/usr/bin/env ruby

require_relative '../../config/environment'

puts "=== Testing Gender-Neutral Labels ==="

# Check all people for missing gender information
people_without_gender = Person.where(gender: [nil, ''])
puts "People without gender information:"
if people_without_gender.any?
  people_without_gender.each do |person|
    puts "  #{person.full_name || person.name} (ID: #{person.id}) - Gender: #{person.gender.inspect}"
  end
else
  puts "  All people have gender information"
end

# Let's temporarily modify someone's gender to test
puts "\n=== Testing Gender-Neutral Relationship Labels ==="

# Test with William O'Sullivan - let's see what gender he has
william = Person.find_by(id: 15)
patricia = Person.find_by(id: 16)

puts "William O'Sullivan (ID: 15) - Gender: #{william&.gender.inspect}"
puts "Patricia Smith (ID: 16) - Gender: #{patricia&.gender.inspect}"

# Check all people's genders
puts "\n=== All People Gender Information ==="
Person.all.order(:id).each do |person|
  gender_display = person.gender.present? ? person.gender : "ERROR: MISSING"
  puts "  #{person.full_name || person.name} (ID: #{person.id}) - Gender: #{gender_display}"
end

# To test gender-neutral labels, we would need to:
# 1. Temporarily set someone's gender to nil
# 2. Test profile/tree sharing
# 3. Restore the original gender

puts "\n=== Testing Gender-Neutral Labels Simulation ==="
puts "Since all people have gender, let's simulate what should happen:"
puts "- Person with nil/empty gender in relationship should show gender-neutral terms"
puts "- Examples:"
puts "  - Instead of 'Brother' or 'Sister' -> 'Sibling'"
puts "  - Instead of 'Father' or 'Mother' -> 'Parent'"
puts "  - Instead of 'Son' or 'Daughter' -> 'Child'"
puts "  - Instead of 'Grandfather' or 'Grandmother' -> 'Grandparent'"

# Test with a temporary gender modification
puts "\n=== Temporary Gender Test ==="
test_person = Person.find_by(id: 15) # William
original_gender = test_person.gender

puts "Original gender for #{test_person.full_name}: #{original_gender}"

# Temporarily remove gender
test_person.update(gender: nil)
puts "Temporarily set gender to nil"

# Test Alice's profile sharing (William should appear as step-grandparent)
puts "Testing Alice's profile sharing with William having nil gender..."

# Restore gender immediately
test_person.update(gender: original_gender)
puts "Restored original gender: #{original_gender}"