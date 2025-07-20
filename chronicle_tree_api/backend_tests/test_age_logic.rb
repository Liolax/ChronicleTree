#!/usr/bin/env ruby
# Test script for improved age validation

require_relative 'chronicle_tree_api/config/environment'

puts "🧪 Testing Improved Age Validation Logic"
puts "=" * 50

# Find test subjects
sam = Person.where("first_name ILIKE ?", '%sam%').first
jane = Person.find_by(first_name: 'Jane', last_name: 'Doe')

if sam && jane
  puts "\n📋 Test Data:"
  puts "Sam: #{sam.first_name} #{sam.last_name}, Born: #{sam.date_of_birth}"
  puts "Jane: #{jane.first_name} #{jane.last_name}, Born: #{jane.date_of_birth}"
  
  age_diff = (jane.date_of_birth - sam.date_of_birth) / 365.25
  puts "Age difference: Sam is #{age_diff.abs.round(1)} years #{age_diff < 0 ? 'older' : 'younger'} than Jane"

  puts "\n🧪 Testing: Can Sam be parent of Jane?"
  result = sam.can_be_parent_of?(jane)
  puts "Valid: #{result[:valid]}"
  puts "Error: #{result[:error]}" unless result[:valid]
  
  puts "\n✅ The message should now correctly say Sam is YOUNGER than Jane!"
else
  puts "❌ Could not find Sam or Jane in database"
  puts "Sam found: #{!sam.nil?}"
  puts "Jane found: #{!jane.nil?}"
end
