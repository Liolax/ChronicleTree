#!/usr/bin/env ruby

require_relative 'chronicle_tree_api/config/environment'

puts "=== Testing Half-Sibling Implementation ==="

alice = Person.find_by(id: 3)
charlie = Person.find_by(id: 7)
michael = Person.find_by(id: 13)

puts "Testing relationships:"
puts "Alice (#{alice.id}) ↔ Charlie (#{charlie.id}) - should be FULL siblings"
puts "Alice (#{alice.id}) ↔ Michael (#{michael.id}) - should be HALF siblings"
puts "Charlie (#{charlie.id}) ↔ Michael (#{michael.id}) - should be HALF siblings"

puts "\n=== Testing Tree Sharing (Alice as Root) ==="

# Test tree sharing with Alice as root
class TestAliceTreeGenerator < ImageGeneration::TreeSnippetGenerator
  def initialize
    @root_person_id = 3  # Alice
    @root_person = Person.find(@root_person_id)
  end
  
  def test_sibling_relationships
    puts "Testing sibling relationships from Alice's perspective:"
    
    charlie = Person.find(7)
    michael = Person.find(13)
    
    puts "Charlie's relationship to Alice: #{get_relationship_to_root(charlie)}"
    puts "Michael's relationship to Alice: #{get_relationship_to_root(michael)}"
    
    # Test the half-sibling detection methods
    puts "\nHalf-sibling detection:"
    puts "Charlie is half-sibling of Alice: #{is_half_sibling_of_root?(charlie)}"
    puts "Michael is half-sibling of Alice: #{is_half_sibling_of_root?(michael)}"
    
    # Test step-sibling detection (should be false for both since they share parents)
    puts "\nStep-sibling detection:"
    puts "Charlie is step-sibling of Alice: #{is_step_sibling_of_root?(charlie)}"
    puts "Michael is step-sibling of Alice: #{is_step_sibling_of_root?(michael)}"
  end
end

begin
  alice_tree_test = TestAliceTreeGenerator.new
  alice_tree_test.test_sibling_relationships
rescue => e
  puts "❌ Error testing Alice's tree: #{e.message}"
  puts "Backtrace: #{e.backtrace.first(3)}"
end

puts "\n=== Testing Profile Sharing (Alice) ==="

# Test profile sharing
generator = ImageGeneration::ProfileCardGenerator.new
generator.instance_variable_set(:@person, alice)

begin
  relationships = generator.send(:get_family_relationships)
  
  puts "Alice's family relationships:"
  relationships.each_with_index do |rel, index|
    puts "  #{index + 1}. #{rel}"
  end
  
  # Check for correct sibling labels
  charlie_relationships = relationships.select { |r| r.include?('Charlie Doe') }
  michael_relationships = relationships.select { |r| r.include?('Michael Doe') }
  
  puts "\nCharlie relationships: #{charlie_relationships}"
  puts "Michael relationships: #{michael_relationships}"
  
  # Verify correct labels
  if charlie_relationships.any? { |r| r.include?('Brother') && !r.include?('Half-') }
    puts "✅ Charlie correctly labeled as full Brother"
  elsif charlie_relationships.any? { |r| r.include?('Half-Brother') }
    puts "❌ Charlie incorrectly labeled as Half-Brother (should be full Brother)"
  else
    puts "❌ Charlie relationship not found or incorrect"
  end
  
  if michael_relationships.any? { |r| r.include?('Half-Brother') }
    puts "✅ Michael correctly labeled as Half-Brother"
  elsif michael_relationships.any? { |r| r.include?('Brother') && !r.include?('Half-') }
    puts "❌ Michael incorrectly labeled as full Brother (should be Half-Brother)"
  else
    puts "❌ Michael relationship not found or incorrect"
  end
  
rescue => e
  puts "❌ Error testing Alice's profile: #{e.message}"
  puts "Backtrace: #{e.backtrace.first(3)}"
end

puts "\n=== Testing Step-Sibling Logic ==="

# Test step-sibling calculation
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

if step_stats[:step_siblings].empty?
  puts "✅ No step-siblings found (correct - Michael is now properly classified as half-sibling)"
else
  puts "❌ Step-siblings still found - logic may need adjustment"
end

puts "\n=== Summary ==="
puts "Expected results:"
puts "✅ Alice ↔ Charlie: Full siblings (Brother/Sister)"  
puts "✅ Alice ↔ Michael: Half-siblings (Half-Brother/Half-Sister)"
puts "✅ No step-siblings (Michael was incorrectly classified before)"
puts "✅ Lisa remains as Step-Mother (correct)"
puts "✅ William/Patricia remain as Step-Grandparents (correct)"