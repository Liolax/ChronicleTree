#!/usr/bin/env ruby

require_relative '../../config/environment'

alice = Person.find_by(id: 3)
michael = Person.find_by(id: 13)
john = Person.find_by(id: 1)
jane = Person.find_by(id: 2)
lisa = Person.find_by(id: 12)

puts "=== Verifying Parent-Child Relationships ==="

puts "\n1. Alice's Parents:"
alice.relationships.where(relationship_type: 'parent').each do |rel|
  parent = Person.find_by(id: rel.relative_id)
  puts "   Alice -> parent -> #{parent.full_name} (ID: #{parent.id})"
end

puts "\n2. Michael's Parents:"
michael.relationships.where(relationship_type: 'parent').each do |rel|
  parent = Person.find_by(id: rel.relative_id)
  puts "   Michael -> parent -> #{parent.full_name} (ID: #{parent.id})"
end

puts "\n3. John's Children:"
john.relationships.where(relationship_type: 'child').each do |rel|
  child = Person.find_by(id: rel.relative_id)
  puts "   John -> child -> #{child.full_name} (ID: #{child.id})"
end

puts "\n4. Lisa's Children:"
lisa.relationships.where(relationship_type: 'child').each do |rel|
  child = Person.find_by(id: rel.relative_id)
  puts "   Lisa -> child -> #{child.full_name} (ID: #{child.id})"
end

puts "\n=== Relationship Analysis ==="
puts "If Alice and Michael both have John as a parent:"
puts "- Alice: John (father) + Jane (mother)"  
puts "- Michael: John (father) + Lisa (mother)"
puts "- They are HALF-SIBLINGS (same father, different mothers)"
puts "- NOT step-siblings"

puts "\nIf Michael should be Lisa's child from a previous relationship:"
puts "- Alice: John (father) + Jane (mother)"
puts "- Michael: Previous father + Lisa (mother)"  
puts "- John marries Lisa"
puts "- Alice and Michael would be STEP-SIBLINGS"

puts "\n=== Checking John-Michael Parent Relationship ==="
john_michael_parent = john.relationships.find { |r| r.relative_id == michael.id && r.relationship_type == 'child' }
michael_john_parent = michael.relationships.find { |r| r.relative_id == john.id && r.relationship_type == 'parent' }

puts "John -> child -> Michael: #{john_michael_parent ? 'YES' : 'NO'}"
puts "Michael -> parent -> John: #{michael_john_parent ? 'YES' : 'NO'}"

if john_michael_parent && michael_john_parent
  puts "\nERROR: PROBLEM: Michael is set as John's biological child"
  puts "This makes Alice and Michael HALF-SIBLINGS, not step-siblings"
  puts "To fix: Remove John-Michael parent relationship if Michael should be step-son only"
end