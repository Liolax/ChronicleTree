#!/usr/bin/env ruby

require_relative '../../config/environment'

puts "=== Testing Step-Grandparent Logic Fix ==="

# The current issue: William and Patricia are Lisa's parents
# Lisa is married to John (Alice's father)
# Therefore William and Patricia should be Alice's step-grandparents

alice = Person.find_by(id: 3)   # Root person
john = Person.find_by(id: 1)    # Alice's father
lisa = Person.find_by(id: 12)   # John's current wife (Alice's step-mother)
william = Person.find_by(id: 15) # Lisa's father (should be step-grandfather)
patricia = Person.find_by(id: 16) # Lisa's mother (should be step-grandmother)

puts "Family structure:"
puts "Alice (#{alice.id}) -> parent -> John (#{john.id})"
puts "John (#{john.id}) -> spouse -> Lisa (#{lisa.id})"
puts "Lisa (#{lisa.id}) -> parent -> William (#{william.id})"
puts "Lisa (#{lisa.id}) -> parent -> Patricia (#{patricia.id})"
puts "Therefore: William and Patricia should be Alice's step-grandparents"

puts "\n=== Current Logic Analysis ==="
puts "The current is_step_grandparent_of_root? method checks:"
puts "1. Is person married to root's biological grandparent? NO - William/Patricia are not married to anyone"
puts "2. Is person parent of root's step-parent? NO - because the method looks for other_parent_spouses.include?(parent)"
puts "   But John (Alice's parent) is not in other_parents since Alice only has one living parent"

puts "\n=== Correct Logic Should Be ==="
puts "A step-grandparent is someone who is a parent of a person who is married to the root's parent"
puts "In this case:"
puts "- William is parent of Lisa"
puts "- Lisa is married to John"  
puts "- John is parent of Alice"
puts "- Therefore William is Alice's step-grandfather"

puts "\n=== Testing Parents and Spouses ==="
alice_parents = alice.parents
puts "Alice's parents: #{alice_parents.map { |p| "#{p.full_name} (#{p.id})" }}"

john_spouses = john.relationships.where(relationship_type: 'spouse', is_ex: false).map { |r| Person.find(r.relative_id) }
puts "John's current spouses: #{john_spouses.map { |p| "#{p.full_name} (#{p.id})" }}"

lisa_parents = lisa.parents
puts "Lisa's parents: #{lisa_parents.map { |p| "#{p.full_name} (#{p.id})" }}"

puts "\n=== Proposed Fix ==="
puts "The method should also check:"
puts "For each parent of root:"
puts "  For each spouse of that parent:"
puts "    For each parent of that spouse:"
puts "      If person == parent of spouse, then person is step-grandparent"

# Test the proposed logic manually
def test_step_grandparent_logic(root_person, candidate_person)
  puts "\nTesting if #{candidate_person.full_name} is step-grandparent of #{root_person.full_name}:"
  
  root_parents = root_person.parents
  puts "  Root parents: #{root_parents.map(&:full_name)}"
  
  root_parents.each do |parent|
    puts "  Checking parent: #{parent.full_name}"
    
    # Get all spouses of this parent
    parent_spouses = parent.relationships.where(relationship_type: 'spouse', is_ex: false).map { |r| Person.find(r.relative_id) }
    puts "    Parent's spouses: #{parent_spouses.map(&:full_name)}"
    
    parent_spouses.each do |spouse|
      puts "    Checking spouse: #{spouse.full_name}"
      
      # Get parents of this spouse
      spouse_parents = spouse.parents
      puts "      Spouse's parents: #{spouse_parents.map(&:full_name)}"
      
      if spouse_parents.include?(candidate_person)
        puts "      ✓ MATCH! #{candidate_person.full_name} is parent of #{spouse.full_name}"
        puts "      Therefore #{candidate_person.full_name} is step-grandparent of #{root_person.full_name}"
        return true
      end
    end
  end
  
  puts "  ERROR: No step-grandparent relationship found"
  false
end

test_step_grandparent_logic(alice, william)
test_step_grandparent_logic(alice, patricia)