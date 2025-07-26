#!/usr/bin/env ruby

require_relative 'chronicle_tree_api/config/environment'

# Test the relationship calculator for Alice and Michael
alice = Person.find_by(id: 3)
michael = Person.find_by(id: 13)

puts "=== Testing Relationship Calculator ==="
puts "Alice Doe (ID: 3) -> Michael Doe (ID: 13)"

# Get user's people and relationships data
user = alice.user
all_people = user.people.includes(:relationships).to_a

# Build relationships array in the format expected by the frontend
relationships = []
all_people.each do |person|
  person.relationships.each do |rel|
    if all_people.map(&:id).include?(rel.relative_id)
      relationships << {
        source: person.id,
        target: rel.relative_id,
        relationship_type: rel.relationship_type,
        is_ex: rel.is_ex || false,
        is_deceased: rel.is_deceased || false
      }
    end
  end
end

puts "\nAll relationships in system:"
relationships.each do |rel|
  source_person = all_people.find { |p| p.id == rel[:source] }
  target_person = all_people.find { |p| p.id == rel[:target] }
  status = ""
  status += " [EX]" if rel[:is_ex]
  status += " [DECEASED]" if rel[:is_deceased]
  puts "  #{source_person.full_name} -> #{rel[:relationship_type]} -> #{target_person.full_name}#{status}"
end

# Check specific relationships for step-sibling calculation
puts "\n=== Alice's Parent Relationships ==="
alice_parents = relationships.select { |r| r[:source] == alice.id && r[:relationship_type] == 'parent' }
alice_parents.each do |rel|
  parent = all_people.find { |p| p.id == rel[:target] }
  puts "  Alice -> parent -> #{parent.full_name}"
end

puts "\n=== Michael's Parent Relationships ==="
michael_parents = relationships.select { |r| r[:source] == michael.id && r[:relationship_type] == 'parent' }
michael_parents.each do |rel|
  parent = all_people.find { |p| p.id == rel[:target] }
  puts "  Michael -> parent -> #{parent.full_name}"
end

puts "\n=== John's Spouse Relationships ==="
john_spouses = relationships.select { |r| r[:source] == 1 && r[:relationship_type] == 'spouse' }
john_spouses.each do |rel|
  spouse = all_people.find { |p| p.id == rel[:target] }
  status = rel[:is_ex] ? " [EX]" : ""
  status += rel[:is_deceased] ? " [DECEASED]" : ""
  puts "  John -> spouse -> #{spouse.full_name}#{status}"
end

puts "\n=== Step-Sibling Logic Check ==="
puts "For Alice and Michael to be step-siblings:"
puts "1. They should share at least one step-parent"
puts "2. They should NOT share all parents (that would make them biological siblings)"

# Check if they share any parents
shared_parents = []
alice_parents.each do |alice_parent|
  michael_parents.each do |michael_parent|
    if alice_parent[:target] == michael_parent[:target]
      shared_parent = all_people.find { |p| p.id == alice_parent[:target] }
      shared_parents << shared_parent.full_name
    end
  end
end

puts "\nShared parents: #{shared_parents.empty? ? 'NONE' : shared_parents.join(', ')}"

# Check for step-parent relationships
puts "\nStep-parent analysis:"
alice_parents.each do |alice_parent_rel|
  alice_parent = all_people.find { |p| p.id == alice_parent_rel[:target] }
  puts "  Alice's parent: #{alice_parent.full_name}"
  
  # Check this parent's spouses
  parent_spouses = relationships.select { |r| r[:source] == alice_parent.id && r[:relationship_type] == 'spouse' && !r[:is_ex] }
  parent_spouses.each do |spouse_rel|
    spouse = all_people.find { |p| p.id == spouse_rel[:target] }
    puts "    #{alice_parent.full_name}'s spouse: #{spouse.full_name}"
    
    # Check if this spouse is Michael's parent
    is_michael_parent = michael_parents.any? { |mp| mp[:target] == spouse.id }
    if is_michael_parent
      puts "      ✓ #{spouse.full_name} is also Michael's parent -> STEP-SIBLING relationship exists!"
    else
      puts "      - #{spouse.full_name} is not Michael's parent"
    end
  end
end