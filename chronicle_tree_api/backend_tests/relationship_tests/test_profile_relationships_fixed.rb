#!/usr/bin/env ruby

require_relative '../../config/environment'

puts "=== Testing Profile Generator Family Relationships ==="

alice = Person.find_by(id: 3)
puts "Testing get_family_relationships for #{alice.full_name}:"

# Create a profile generator instance with the correct person setup
generator = ImageGeneration::ProfileCardGenerator.new

# We need to set the @person instance variable since the method relies on it  
generator.instance_variable_set(:@person, alice)

begin
  # Call the method directly
  relationships = generator.send(:get_family_relationships)
  
  puts "✓ get_family_relationships executed successfully"
  puts "Total relationships found: #{relationships.length}"
  
  puts "\nAll family relationships:"
  relationships.each_with_index do |rel, index|
    puts "  #{index + 1}. #{rel}"
  end
  
  # Check for step-relationships specifically
  step_relations = relationships.select { |r| r.include?('Step-') }
  puts "\nStep-relationships found: #{step_relations.length}"
  
  if step_relations.any?
    puts "✓ Step-relationships are included:"
    step_relations.each { |rel| puts "  - #{rel}" }
  else
    puts "❌ No step-relationships found in profile!"
    
    puts "\nExpected step-relationships for Alice:"
    puts "- Step-Mother: Lisa Doe"
    puts "- Step-Brother: Michael Doe" 
    puts "- Step-Grandfather: William O'Sullivan"
    puts "- Step-Grandmother: Patricia Smith"
  end
  
  # Look for specific people
  expected_step_relatives = [
    "Lisa Doe",      # Step-mother
    "Michael Doe",   # Step-brother  
    "William O'Sullivan", # Step-grandfather
    "Patricia Smith" # Step-grandmother
  ]
  
  puts "\nChecking for expected step-relatives:"
  expected_step_relatives.each do |name|
    found = relationships.any? { |r| r.include?(name) }
    status = found ? "✓" : "❌"
    puts "  #{status} #{name}: #{found ? 'FOUND' : 'MISSING'}"
  end
  
rescue => e
  puts "❌ Error testing profile relationships: #{e.message}"
  puts "Backtrace:"
  e.backtrace.first(5).each { |line| puts "  #{line}" }
end

puts "\n=== Manual Relationship Check ==="

# Let's manually check what step-relationships should exist for Alice
puts "Manual verification of Alice's step-relationships:"

# Alice's parents
alice_parents = alice.parents
puts "Alice's biological parents: #{alice_parents.map(&:full_name)}"

# Alice's father's spouses (should include Lisa as step-mother)
john = alice_parents.find { |p| p.full_name == "John Doe" }
if john
  john_spouses = john.relationships.where(relationship_type: 'spouse', is_ex: false).map { |r| Person.find(r.relative_id) }
  puts "John's current spouses: #{john_spouses.map(&:full_name)}"
  
  # Lisa should be a step-mother
  lisa = john_spouses.find { |s| s.full_name == "Lisa Doe" }
  if lisa && !alice_parents.include?(lisa)
    puts "✓ Lisa Doe should be step-mother"
    
    # Lisa's parents should be step-grandparents
    lisa_parents = lisa.parents
    puts "Lisa's parents (Alice's step-grandparents): #{lisa_parents.map(&:full_name)}"
    
    # Lisa's children should be step-siblings
    lisa_children = lisa.children.reject { |c| c == alice } # Exclude Alice herself
    puts "Lisa's other children (Alice's step-siblings): #{lisa_children.map(&:full_name)}"
  end
end