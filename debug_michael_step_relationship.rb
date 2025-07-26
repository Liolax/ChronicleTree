#!/usr/bin/env ruby

require_relative 'chronicle_tree_api/config/environment'

puts "=== Debugging Michael's Relationship to Alice ==="

alice = Person.find_by(id: 3)
michael = Person.find_by(id: 13)

puts "Alice: #{alice.full_name} (ID: #{alice.id})"
puts "Michael: #{michael.full_name} (ID: #{michael.id})"

# Check if there's a direct sibling relationship in the database
puts "\n=== Direct Database Relationships ==="
alice_to_michael = alice.relationships.find_by(relative_id: michael.id)
michael_to_alice = michael.relationships.find_by(relative_id: alice.id)

puts "Alice -> Michael relationship: #{alice_to_michael&.relationship_type || 'NONE'}"
puts "Michael -> Alice relationship: #{michael_to_alice&.relationship_type || 'NONE'}"

# Check biological siblings
puts "\n=== Biological Siblings Check ==="
alice_biological_siblings = alice.siblings
puts "Alice's biological siblings: #{alice_biological_siblings.map(&:full_name)}"

michael_in_biological_siblings = alice_biological_siblings.include?(michael)
puts "Michael in Alice's biological siblings: #{michael_in_biological_siblings ? '✓' : '❌'}"

# If Michael is in biological siblings, that explains why he shows as "Brother"
# He should NOT be in biological siblings - he should only be a step-sibling

if michael_in_biological_siblings
  puts "\n❌ PROBLEM FOUND: Michael is incorrectly marked as Alice's biological sibling!"
  puts "This is why he shows as 'Brother' instead of 'Step-Brother'"
  
  # Check their parents
  puts "\nParents comparison:"
  puts "Alice's parents: #{alice.parents.map(&:full_name)}"
  puts "Michael's parents: #{michael.parents.map(&:full_name)}"
  
  shared_parents = alice.parents & michael.parents
  puts "Shared parents: #{shared_parents.map(&:full_name)}"
  
  if shared_parents.any?
    puts "They share #{shared_parents.length} parent(s) - this makes them biological half-siblings"
  else
    puts "They share NO parents - this should make them step-siblings only"
  end
else
  puts "✓ Michael is correctly NOT in Alice's biological siblings"
end

puts "\n=== Step-Sibling Detection ==="
# Test if Michael should be detected as step-sibling
# Michael should be step-sibling because:
# - Lisa is married to John (Alice's father)
# - Michael is Lisa's son
# - Michael is not Alice's biological sibling

lisa = Person.find_by(id: 12)
john = Person.find_by(id: 1)

puts "Expected step-sibling logic:"
puts "1. Lisa (#{lisa.id}) is married to John (#{john.id}): #{john.relationships.exists?(relative_id: lisa.id, relationship_type: 'spouse', is_ex: false)}"
puts "2. John is Alice's parent: #{alice.relationships.exists?(relative_id: john.id, relationship_type: 'parent')}"
puts "3. Michael is Lisa's child: #{michael.relationships.exists?(relative_id: lisa.id, relationship_type: 'parent')}"
puts "4. Michael is NOT Alice's biological sibling: #{!alice_biological_siblings.include?(michael)}"

if michael_in_biological_siblings
  puts "\n🔧 NEED TO FIX: Remove incorrect biological sibling relationship between Alice and Michael"
end