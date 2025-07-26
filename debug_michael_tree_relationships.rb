#!/usr/bin/env ruby

require_relative 'chronicle_tree_api/config/environment'

puts "=== Debugging Michael's Tree Relationships ==="

michael = Person.find_by(id: 13)
john = Person.find_by(id: 1)

puts "Michael Doe (ID: #{michael.id})"
puts "John Doe (ID: #{john.id})"

puts "\n=== Current Parent-Child Relationships ==="

# Check Michael's parents
michael_parents = michael.relationships.where(relationship_type: 'parent').includes(:relative)
puts "Michael's parents in database:"
michael_parents.each do |rel|
  parent = rel.relative
  puts "  - #{parent.full_name} (ID: #{parent.id})"
end

# Check John's children  
john_children = john.relationships.where(relationship_type: 'child').includes(:relative)
puts "\nJohn's children in database:"
john_children.each do |rel|
  child = rel.relative
  puts "  - #{child.full_name} (ID: #{child.id})"
end

puts "\n=== Bidirectional Relationship Check ==="
michael_to_john = michael.relationships.find_by(relative_id: john.id, relationship_type: 'parent')
john_to_michael = john.relationships.find_by(relative_id: michael.id, relationship_type: 'child')

puts "Michael -> John (parent): #{michael_to_john ? '✓ EXISTS' : '❌ MISSING'}"
puts "John -> Michael (child): #{john_to_michael ? '✓ EXISTS' : '❌ MISSING'}"

if michael_to_john
  puts "  Michael->John relationship details: #{michael_to_john.attributes}"
end

if john_to_michael
  puts "  John->Michael relationship details: #{john_to_michael.attributes}"
end

puts "\n=== The Issue ==="
if !michael_to_john && !john_to_michael
  puts "❌ PROBLEM: NO parent-child relationship exists between Michael and John"
  puts "This explains why John appears as 'Unrelated' in Michael's tree"
  puts "We previously removed this relationship to make Michael Alice's step-brother"
  puts "But this broke Michael's own family tree view"
end

puts "\n=== Family Tree Logic Check ==="
puts "When viewing Michael's tree:"
puts "- Michael is the ROOT person"
puts "- John should be Michael's parent (Generation -1)"
puts "- If no parent relationship exists, John gets classified as 'Unrelated'"

puts "\n=== The Conflict ==="
puts "There's a conflict in the family data requirements:"
puts "1. For Alice's perspective: Michael should be step-brother (no shared parent)"
puts "2. For Michael's perspective: John should be his father"
puts "Both cannot be true simultaneously with current data structure"

puts "\n=== Checking Seeds/Original Data ==="
puts "Let's check what the original family structure should be..."

# Let's examine Lisa's relationships to understand the intended family structure
lisa = Person.find_by(id: 12)
puts "\nLisa Doe (ID: #{lisa.id}) relationships:"

lisa_spouses = lisa.relationships.where(relationship_type: 'spouse').includes(:relative)
puts "Lisa's spouses:"
lisa_spouses.each do |rel|
  spouse = rel.relative
  status = rel.is_ex? ? " (EX)" : ""
  status += rel.is_deceased? ? " (DECEASED)" : ""
  puts "  - #{spouse.full_name} (ID: #{spouse.id})#{status}"
end

lisa_children = lisa.relationships.where(relationship_type: 'child').includes(:relative)
puts "Lisa's children:"
lisa_children.each do |rel|
  child = rel.relative
  puts "  - #{child.full_name} (ID: #{child.id})"
end

puts "\n=== Possible Solutions ==="
puts "1. Michael is John's biological son AND Alice's half-brother (shared father)"
puts "2. Michael is Lisa's son from previous relationship, not John's son"
puts "3. Create more complex step-relationship logic that handles both perspectives"

puts "\nCurrent state after our fix:"
puts "- Michael has only Lisa as parent"
puts "- This makes Michael Alice's step-brother ✓"
puts "- But makes John 'Unrelated' to Michael ❌"