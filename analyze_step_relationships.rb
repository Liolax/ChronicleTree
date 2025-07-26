#!/usr/bin/env ruby

require_relative 'chronicle_tree_api/config/environment'

# Find all key people
alice = Person.find_by(id: 3)
john = Person.find_by(id: 1)  # Alice's father
jane = Person.find_by(id: 2)  # Alice's mother  
lisa = Person.find_by(id: 12) # Should be John's spouse
michael = Person.find_by(id: 13) # Should be Lisa's son (Alice's step-brother)

puts "=== Family Analysis ==="
puts "Alice Doe (ID: 3)"
puts "John Doe (ID: 1) - Alice's father"
puts "Jane Doe (ID: 2) - Alice's mother"
puts "Lisa Doe (ID: 12) - John's spouse?"
puts "Michael Doe (ID: 13) - Lisa's son?"

puts "\n=== John's Relationships ==="
john.relationships.each do |rel|
  relative = Person.find_by(id: rel.relative_id)
  status = rel.is_ex? ? " (EX)" : ""
  status += rel.is_deceased? ? " (DECEASED)" : ""
  puts "  #{rel.relationship_type}: #{relative&.full_name || relative&.name}#{status}"
end

puts "\n=== Lisa's Relationships ==="
lisa.relationships.each do |rel|
  relative = Person.find_by(id: rel.relative_id)
  status = rel.is_ex? ? " (EX)" : ""
  status += rel.is_deceased? ? " (DECEASED)" : ""
  puts "  #{rel.relationship_type}: #{relative&.full_name || relative&.name}#{status}"
end

puts "\n=== Michael's Relationships ==="
michael.relationships.each do |rel|
  relative = Person.find_by(id: rel.relative_id)
  status = rel.is_ex? ? " (EX)" : ""
  status += rel.is_deceased? ? " (DECEASED)" : ""
  puts "  #{rel.relationship_type}: #{relative&.full_name || relative&.name}#{status}"
end

puts "\n=== Alice's Relationships ==="
alice.relationships.each do |rel|
  relative = Person.find_by(id: rel.relative_id)
  status = rel.is_ex? ? " (EX)" : ""
  status += rel.is_deceased? ? " (DECEASED)" : ""
  puts "  #{rel.relationship_type}: #{relative&.full_name || relative&.name}#{status}"
end

# Check if expected step-relationships exist
puts "\n=== Step-Relationship Analysis ==="

# John (Alice's father) married to Lisa?
john_lisa_marriage = john.relationships.find { |r| r.relative_id == lisa.id && r.relationship_type == 'spouse' && !r.is_ex }
puts "John-Lisa marriage: #{john_lisa_marriage ? 'YES' : 'NO'}"

# Lisa is Michael's mother?
lisa_michael_parent = lisa.relationships.find { |r| r.relative_id == michael.id && r.relationship_type == 'child' }
puts "Lisa-Michael parent relationship: #{lisa_michael_parent ? 'YES' : 'NO'}"

# Expected step-relationship: Alice and Michael should be step-siblings
# through John (Alice's father) being married to Lisa (Michael's mother)
alice_michael_step = alice.relationships.find { |r| r.relative_id == michael.id && r.relationship_type == 'sibling' }
puts "Alice-Michael sibling relationship in DB: #{alice_michael_step ? 'YES' : 'NO'}"

puts "\n=== Expected Step-Relationships Based on Structure ==="
if john_lisa_marriage && lisa_michael_parent
  puts "✓ Alice and Michael should be STEP-SIBLINGS"
  puts "  - John (Alice's father) is married to Lisa"
  puts "  - Lisa is Michael's mother"
  puts "  - Therefore: Alice and Michael are step-siblings"
else
  puts "✗ Step-sibling relationship not possible based on current data"
end