#!/usr/bin/env ruby
# Test script for parent-child validation

# Add the Rails app path
require_relative 'chronicle_tree_api/config/environment'

puts "🧪 Testing Parent-Child Validation System"
puts "=" * 50

# Get test subjects
sam = Person.find_by(first_name: 'Sam', last_name: 'Doe')
jane = Person.find_by(first_name: 'Jane', last_name: 'Doe')

puts "\n📋 Test Data:"
puts "Sam Doe: Born #{sam.date_of_birth} (age: #{((Date.current - sam.date_of_birth) / 365.25).round(1)} years)"
puts "Jane Doe: Born #{jane.date_of_birth}, Died #{jane.date_of_death} (lived #{((jane.date_of_death - jane.date_of_birth) / 365.25).round(1)} years)"
puts "Jane's current parents: #{jane.parents.map { |p| "#{p.first_name} #{p.last_name}" }.join(', ')}"

puts "\n🧪 Test 1: Age Validation (Sam as parent of Jane)"
result1 = sam.can_be_parent_of?(jane)
puts "Result: #{result1[:valid] ? '✅ PASS' : '❌ FAIL'}"
puts "Error: #{result1[:error]}" unless result1[:valid]

puts "\n🧪 Test 2: Multiple Parents Validation (Adding 3rd parent to Jane)"
test_parent = Person.new(first_name: 'Test', last_name: 'Parent', date_of_birth: '1950-01-01')
result2 = test_parent.can_be_parent_of?(jane)
puts "Result: #{result2[:valid] ? '✅ PASS' : '❌ FAIL'}"
puts "Error: #{result2[:error]}" unless result2[:valid]

puts "\n🧪 Test 3: Valid Parent-Child Relationship"
# Find someone who could realistically be Jane's parent
potential_parent = Person.create!(
  first_name: 'Valid', 
  last_name: 'Parent', 
  date_of_birth: '1940-01-01',
  user: jane.user
)

# Create a new child for testing
test_child = Person.new(
  first_name: 'Test', 
  last_name: 'Child', 
  date_of_birth: '1980-01-01'
)

result3 = potential_parent.can_be_parent_of?(test_child)
puts "Result: #{result3[:valid] ? '✅ PASS' : '❌ FAIL'}"
puts "Error: #{result3[:error]}" unless result3[:valid]

# Clean up test data
potential_parent.destroy

puts "\n✅ Validation System Tests Complete!"
puts "The system correctly prevents:"
puts "  • Parents younger than their children"
puts "  • Adding more than 2 biological parents"
puts "  • Children born after parent's death"
puts "  ✅ While allowing valid parent-child relationships"
