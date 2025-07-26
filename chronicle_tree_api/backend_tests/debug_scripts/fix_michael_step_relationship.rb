#!/usr/bin/env ruby

require_relative '../../config/environment'

puts "=== Fixing Michael's Relationship to Make Him Alice's Step-Brother ==="

john = Person.find_by(id: 1)
michael = Person.find_by(id: 13)

unless john && michael
  puts "Error: Could not find John or Michael"
  exit 1
end

# Remove the bidirectional parent-child relationship between John and Michael
begin
  ActiveRecord::Base.transaction do
    removed_count = 0
    
    # Remove Michael -> John (parent) relationship
    michael_to_john = michael.relationships.find_by(relative_id: john.id, relationship_type: 'parent')
    if michael_to_john
      michael_to_john.destroy!
      removed_count += 1
    end
    
    # Remove John -> Michael (child) relationship
    john_to_michael = john.relationships.find_by(relative_id: michael.id, relationship_type: 'child')
    if john_to_michael
      john_to_michael.destroy!
      removed_count += 1
    end
    
    puts "Removed #{removed_count} parent-child relationships between John and Michael"
  end
rescue => e
  puts "Error removing relationships: #{e.message}"
  exit 1
end

puts "\n=== Verification After Fix ==="

# Verify the fix
alice = Person.find_by(id: 3)
lisa = Person.find_by(id: 12)

# Check sibling relationships
alice_biological_siblings = alice.siblings
michael_in_biological_siblings = alice_biological_siblings.include?(michael)

puts "Michael in Alice's biological siblings: #{michael_in_biological_siblings ? 'STILL WRONG' : 'CORRECT'}"
puts "Expected: Alice and Michael should be step-siblings (not biological siblings)"
puts "Michael should be Lisa's child, Alice should be John's child"