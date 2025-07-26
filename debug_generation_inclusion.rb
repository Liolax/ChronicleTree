#!/usr/bin/env ruby

require_relative 'chronicle_tree_api/config/environment'

puts "=== Debugging Generation Inclusion Logic ==="

# Test the get_parents_with_step_relationships method
alice = Person.find_by(id: 3)
william = Person.find_by(id: 15)
patricia = Person.find_by(id: 16)

puts "Testing get_parents_with_step_relationships for Alice's parents..."

# Get Alice's parents with step relationships (Generation -1)
alice_parents = alice.parents
puts "Alice's biological parents: #{alice_parents.map(&:full_name)}"

# Simulate the get_parents_with_step_relationships method
def get_parents_with_step_relationships(person)
  biological_parents = person.parents
  step_parents = []
  
  biological_parents.each do |parent|
    # Get spouses of this parent
    parent_spouses = parent.relationships.where(relationship_type: 'spouse', is_ex: false).map { |r| Person.find(r.relative_id) }
    parent_spouses.each do |spouse|
      unless biological_parents.include?(spouse)
        step_parents << spouse
      end
    end
  end
  
  (biological_parents + step_parents).uniq
end

parents_with_step = get_parents_with_step_relationships(alice)
puts "Alice's parents with step-relationships: #{parents_with_step.map(&:full_name)}"

puts "\n=== Testing Generation -2 (Grandparents) Logic ==="
puts "The logic for generation -2 is:"
puts "get_parents_with_step_relationships(@root_person).flat_map { |p| get_parents_with_step_relationships(p) }.uniq"

grandparents_generation = []

parents_with_step.each do |parent|
  puts "\nChecking parent: #{parent.full_name} (ID: #{parent.id})"
  
  parent_grandparents = get_parents_with_step_relationships(parent)
  puts "  Grandparents from #{parent.full_name}: #{parent_grandparents.map(&:full_name)}"
  
  grandparents_generation.concat(parent_grandparents)
end

grandparents_generation.uniq!
puts "\nAll people in Generation -2: #{grandparents_generation.map(&:full_name)}"

# Check if William and Patricia are included
if grandparents_generation.include?(william)
  puts "✓ William O'Sullivan is included in Generation -2"
else
  puts "❌ William O'Sullivan is NOT included in Generation -2"
end

if grandparents_generation.include?(patricia)
  puts "✓ Patricia Smith is included in Generation -2"
else
  puts "❌ Patricia Smith is NOT included in Generation -2"
end

puts "\n=== The Issue ==="
puts "William and Patricia are Lisa's parents, but Lisa is a step-parent (spouse of John)."
puts "The current logic only gets parents of people in Generation -1."
puts "Generation -1 includes: #{parents_with_step.map(&:full_name)}"
puts "Lisa's parents (William/Patricia) should be included because Lisa is in Generation -1."

# Let's verify Lisa is in Generation -1
lisa = Person.find_by(id: 12)
if parents_with_step.include?(lisa)
  puts "✓ Lisa is correctly included in Generation -1"
  lisa_parents = get_parents_with_step_relationships(lisa)
  puts "Lisa's parents: #{lisa_parents.map(&:full_name)}"
  
  if lisa_parents.include?(william) && lisa_parents.include?(patricia)
    puts "✓ William and Patricia are Lisa's parents"
    puts "✓ This means they SHOULD be included in Generation -2"
  end
else
  puts "❌ Lisa is NOT included in Generation -1 - this is the problem!"
end