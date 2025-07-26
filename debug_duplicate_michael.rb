#!/usr/bin/env ruby

require_relative 'chronicle_tree_api/config/environment'

puts "=== Debugging Duplicate Michael in Profile ==="

alice = Person.find_by(id: 3)
michael = Person.find_by(id: 13)

puts "Alice (#{alice.id}), Michael (#{michael.id})"

puts "\n=== Biological Sibling Check ==="
alice_biological_siblings = alice.siblings
puts "Alice's biological siblings: #{alice_biological_siblings.map(&:full_name)}"
puts "Michael in biological siblings: #{alice_biological_siblings.include?(michael)}"

puts "\n=== Step-Sibling Calculation Debug ==="

# Test the step-sibling calculation logic
generator = ImageGeneration::ProfileCardGenerator.new
generator.instance_variable_set(:@person, alice)

# Get the data for step-relationship calculation
all_people = alice.user.people.to_a
all_relationships = []

all_people.each do |person|
  person.relationships.each do |rel|
    if all_people.map(&:id).include?(rel.relative_id)
      all_relationships << {
        source: person.id,
        target: rel.relative_id,
        relationship_type: rel.relationship_type,
        is_ex: rel.is_ex || false,
        is_deceased: rel.is_deceased || false
      }
    end
  end
end

step_stats = generator.send(:calculate_step_relationships_for_profile, alice, all_people, all_relationships)

puts "Step-siblings found: #{step_stats[:step_siblings].length}"
step_stats[:step_siblings].each do |ss|
  puts "  - #{ss[:full_name]} (ID: #{ss[:id]})"
end

puts "\n=== The Problem ==="
puts "Michael should NOT be in step-siblings because:"
puts "1. He IS in Alice's biological siblings (they share father John)"
puts "2. Step-sibling logic should exclude biological siblings"

puts "\n=== Step-Sibling Logic Analysis ==="
puts "The step-sibling calculation logic should check:"
puts "1. Find parents' spouses' children"
puts "2. EXCLUDE those who are already biological siblings"
puts "The current logic might be missing the exclusion check"

# Let's trace through the step-sibling logic manually
john = Person.find_by(id: 1)
lisa = Person.find_by(id: 12)

puts "\nManual step-sibling trace:"
puts "1. Alice's parent John is married to Lisa"
puts "2. Lisa's children: #{lisa.children.map(&:full_name)}"
puts "3. Lisa's child Michael should be EXCLUDED because he's Alice's biological sibling"

biological_siblings = all_relationships.select { |rel| rel[:source] == alice.id && rel[:relationship_type] == 'sibling' }
puts "\nAlice's biological sibling relationships in data:"
biological_siblings.each do |bs|
  sibling = all_people.find { |p| p.id == bs[:target] }
  puts "  - #{sibling.full_name} (ID: #{sibling.id})"
end

michael_is_biological_sibling = biological_siblings.any? { |bs| bs[:target] == michael.id }
puts "\nMichael in biological sibling relationships: #{michael_is_biological_sibling ? '✓' : '❌'}"

if michael_is_biological_sibling
  puts "✅ Michael is correctly recorded as biological sibling"
  puts "❌ But he's still being detected as step-sibling - logic bug in step-relationship calculation"
else
  puts "❌ Michael is missing from biological sibling relationships - data issue"
end