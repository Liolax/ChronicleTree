#!/usr/bin/env ruby

require_relative 'chronicle_tree_api/config/environment'

puts "=== Verifying Family Structure ==="

# Key people
alice = Person.find_by(id: 3)
john = Person.find_by(id: 1)
lisa = Person.find_by(id: 12)
michael = Person.find_by(id: 13)

puts "Alice Doe (#{alice.id})"
puts "John Doe (#{john.id})"
puts "Lisa Doe (#{lisa.id})"
puts "Michael Doe (#{michael.id})"

puts "\n=== Checking Parent-Child Relationships ==="

# Alice's parents
alice_parents = alice.relationships.where(relationship_type: 'parent').map do |rel|
  parent = Person.find(rel.relative_id)
  "#{parent.full_name} (ID: #{parent.id})"
end
puts "Alice's parents: #{alice_parents}"

# Michael's parents
michael_parents = michael.relationships.where(relationship_type: 'parent').map do |rel|
  parent = Person.find(rel.relative_id)
  "#{parent.full_name} (ID: #{parent.id})"
end
puts "Michael's parents: #{michael_parents}"

puts "\n=== John's Children ==="
john_children = john.relationships.where(relationship_type: 'child').map do |rel|
  child = Person.find(rel.relative_id)
  "#{child.full_name} (ID: #{child.id})"
end
puts "John's children: #{john_children}"

puts "\n=== Lisa's Children ==="
lisa_children = lisa.relationships.where(relationship_type: 'child').map do |rel|
  child = Person.find(rel.relative_id)
  "#{child.full_name} (ID: #{child.id})"
end
puts "Lisa's children: #{lisa_children}"

puts "\n=== Analysis ==="
puts "If Michael should be Alice's STEP-brother (not half-brother), then:"
puts "- Michael should NOT be John's biological child"
puts "- Michael should ONLY be Lisa's child from a previous relationship"
puts "- The parent relationship between John and Michael should be removed"

puts "\nCurrent situation:"
john_is_michael_parent = michael.relationships.exists?(relative_id: john.id, relationship_type: 'parent')
lisa_is_michael_parent = michael.relationships.exists?(relative_id: lisa.id, relationship_type: 'parent')

puts "John is Michael's parent: #{john_is_michael_parent ? '✓' : '❌'}"
puts "Lisa is Michael's parent: #{lisa_is_michael_parent ? '✓' : '❌'}"

if john_is_michael_parent && lisa_is_michael_parent
  puts "\n❌ INCORRECT: Michael has BOTH John and Lisa as parents"
  puts "This makes Michael Alice's half-brother (shared father John)"
  puts "To make Michael Alice's step-brother, remove John-Michael parent relationship"
elsif !john_is_michael_parent && lisa_is_michael_parent
  puts "\n✓ CORRECT: Michael has ONLY Lisa as parent"
  puts "This makes Michael Alice's step-brother through Lisa's marriage to John"
end

puts "\n=== Current Marriage Status ==="
john_lisa_marriage = john.relationships.find_by(relative_id: lisa.id, relationship_type: 'spouse')
if john_lisa_marriage
  puts "John-Lisa marriage: EXISTS (ex: #{john_lisa_marriage.is_ex}, deceased: #{john_lisa_marriage.is_deceased})"
else
  puts "John-Lisa marriage: MISSING"
end