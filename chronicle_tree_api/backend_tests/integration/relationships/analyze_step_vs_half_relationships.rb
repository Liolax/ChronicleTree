#!/usr/bin/env ruby

require_relative '../../config/environment'

puts "=== Analyzing Step vs Half Relationships ==="

# Key family members
alice = Person.find_by(id: 3)
charlie = Person.find_by(id: 7)
michael = Person.find_by(id: 13)
john = Person.find_by(id: 1)
jane = Person.find_by(id: 2)
lisa = Person.find_by(id: 12)

puts "Family Structure Analysis:"
puts "John Doe (#{john.id}) - Father"
puts "├── First marriage: Jane Doe (#{jane.id}) - deceased"
puts "│   ├── Alice Doe (#{alice.id})"
puts "│   └── Charlie Doe (#{charlie.id})"
puts "└── Second marriage: Lisa Doe (#{lisa.id}) - current"
puts "    └── Michael Doe (#{michael.id})"

puts "\n=== Current vs Correct Relationship Types ==="

puts "\n1. SIBLINGS - Alice, Charlie, Michael:"
puts "   Current: All marked as 'siblings'"
puts "   Correct:"
puts "   - Alice ↔ Charlie: FULL siblings (share both parents: John + Jane)"
puts "   - Alice ↔ Michael: HALF siblings (share one parent: John)"
puts "   - Charlie ↔ Michael: HALF siblings (share one parent: John)"

puts "\n2. PARENTS - From children's perspective:"
puts "   Alice's parents:"
puts "   - John: Biological Father ✓"
puts "   - Jane: Biological Mother ✓" 
puts "   - Lisa: STEP-Mother (married to Alice's father, no biological connection)"
puts ""
puts "   Michael's parents:"
puts "   - John: Biological Father ✓"
puts "   - Lisa: Biological Mother ✓"
puts "   - Jane: No relationship (deceased before Michael's birth)"

puts "\n3. GRANDPARENTS - From grandchildren's perspective:"
puts "   Alice's grandparents:"
puts "   - John's parents: Biological grandparents ✓"
puts "   - Jane's parents: Biological grandparents ✓"
puts "   - Lisa's parents (William/Patricia): STEP-grandparents (no biological connection)"
puts ""
puts "   Michael's grandparents:"
puts "   - John's parents: Biological grandparents ✓"
puts "   - Lisa's parents: Biological grandparents ✓"
puts "   - Jane's parents: No relationship"

puts "\n=== Half-Relationship Logic Needed ==="

puts "\n1. Half-Siblings Detection:"
puts "   - Find people who share exactly ONE parent"
puts "   - Display as 'Half-Brother', 'Half-Sister', or 'Half-Sibling'"

puts "\n2. Step-Relationship Correction:"
puts "   - Step-parent: Spouse of biological parent (no biological connection)"
puts "   - Step-child: Child of spouse from previous relationship"
puts "   - Step-sibling: Child of step-parent from previous relationship (no shared parents)"
puts "   - Step-grandparent: Parent of step-parent"

puts "\n3. Current Issues to Fix:"
puts "   ERROR: Michael shows as 'Brother' - should be 'Half-Brother'"
puts "   ERROR: No distinction between full and half siblings"
puts "   ERROR: Step-relationships might be incorrectly assigned to half-relationships"

puts "\n=== Implementation Plan ==="
puts "1. Add half-sibling detection logic"
puts "2. Update relationship type methods to return 'Half-X' when appropriate"  
puts "3. Modify step-relationship logic to exclude half-relationships"
puts "4. Update both tree sharing and profile sharing to use half-relationship labels"

puts "\n=== Testing Current Shared Parent Logic ==="

def get_shared_parents(person1, person2)
  person1_parents = person1.parents
  person2_parents = person2.parents
  shared = person1_parents & person2_parents
  puts "#{person1.full_name} parents: #{person1_parents.map(&:full_name)}"
  puts "#{person2.full_name} parents: #{person2_parents.map(&:full_name)}"
  puts "Shared parents: #{shared.map(&:full_name)} (#{shared.length})"
  puts "Relationship type: #{
    case shared.length
    when 0 then 'No biological relationship (could be step-siblings)'
    when 1 then 'HALF-siblings'
    when 2 then 'FULL siblings'
    else 'Invalid (more than 2 parents)'
    end
  }"
  puts ""
  shared
end

puts "Alice ↔ Charlie:"
get_shared_parents(alice, charlie)

puts "Alice ↔ Michael:"
get_shared_parents(alice, michael)

puts "Charlie ↔ Michael:"
get_shared_parents(charlie, michael)