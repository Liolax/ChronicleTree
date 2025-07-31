#!/usr/bin/env ruby

require_relative '../../config/environment'

puts "=== Testing Step-Grandparent Relationships ==="

# Let's look for step-grandparent relationships
# Pattern: Person -> Step-Parent -> Step-Parent's Parent = Step-Grandparent

puts "\n=== Family Structure Analysis ==="

# Find all marriage relationships
marriages = []
Person.all.each do |person|
  person.relationships.where(relationship_type: 'spouse').each do |spouse_rel|
    spouse = Person.find_by(id: spouse_rel.relative_id)
    status = spouse_rel.is_ex? ? " (EX)" : ""
    status += spouse_rel.is_deceased? ? " (DECEASED)" : ""
    marriages << "#{person.full_name} <-> #{spouse.full_name}#{status}"
  end
end

puts "All marriages:"
marriages.uniq.each { |m| puts "  #{m}" }

puts "\n=== Looking for Step-Grandparent Candidates ==="

# Example: Lisa's parents (William, Patricia) should be step-grandparents to Alice
# because Lisa married John (Alice's father)

alice = Person.find_by(id: 3)
john = Person.find_by(id: 1)
lisa = Person.find_by(id: 12)
william = Person.find_by(id: 15)  # Lisa's father
patricia = Person.find_by(id: 16) # Lisa's mother

puts "\nCandidate step-grandparent relationship:"
puts "Alice (3) -> John (father) -> Lisa (step-mother) -> William/Patricia (step-grandparents)"

puts "\nVerifying the chain:"
puts "1. Alice -> parent -> John: #{alice.relationships.exists?(relative_id: john.id, relationship_type: 'parent')}"
puts "2. John -> spouse -> Lisa: #{john.relationships.exists?(relative_id: lisa.id, relationship_type: 'spouse', is_ex: [false, nil])}"
puts "3. Lisa -> parent -> William: #{lisa.relationships.exists?(relative_id: william.id, relationship_type: 'parent')}"
puts "4. Lisa -> parent -> Patricia: #{lisa.relationships.exists?(relative_id: patricia.id, relationship_type: 'parent')}"

if william && patricia
  puts "\n✓ Step-grandparent chain exists:"
  puts "  Alice should see William as 'Step-Grandfather'"
  puts "  Alice should see Patricia as 'Step-Grandmother'"
else
  puts "\nERROR: Step-grandparent candidates not found"
end

# Test another case: Michael's perspective
puts "\n=== Michael's Step-Grandparent Candidates ==="
michael = Person.find_by(id: 13)
jane = Person.find_by(id: 2)  # John's deceased wife, Alice's mother
richard = Person.find_by(id: 17) # Jane's father
margaret = Person.find_by(id: 18) # Jane's mother

puts "Candidate step-grandparent relationship:"
puts "Michael (13) -> John (father) -> Jane (step-mother, deceased) -> Richard/Margaret (step-grandparents)"

puts "\nVerifying the chain:"
puts "1. Michael -> parent -> John: #{michael.relationships.exists?(relative_id: john.id, relationship_type: 'parent')}"
puts "2. John -> spouse -> Jane: #{john.relationships.exists?(relative_id: jane.id, relationship_type: 'spouse')}"
puts "3. Jane -> parent -> Richard: #{jane.relationships.exists?(relative_id: richard.id, relationship_type: 'parent')}"
puts "4. Jane -> parent -> Margaret: #{jane.relationships.exists?(relative_id: margaret.id, relationship_type: 'parent')}"

if richard && margaret
  puts "\n✓ Step-grandparent chain exists:"
  puts "  Michael should see Richard as 'Step-Grandfather'"
  puts "  Michael should see Margaret as 'Step-Grandmother'"
  puts "  (Through John's deceased wife Jane)"
else
  puts "\nERROR: Step-grandparent candidates not found"
end

puts "\n=== Testing Tree Sharing for Step-Grandparents ==="
puts "Let's test Alice's tree sharing to see if William/Patricia appear correctly..."