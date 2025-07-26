#!/usr/bin/env ruby

require_relative 'chronicle_tree_api/config/environment'

puts "=== Fixing Michael's Relationship to Make Him Alice's Step-Brother ==="

john = Person.find_by(id: 1)
michael = Person.find_by(id: 13)

puts "Current situation:"
puts "John Doe (#{john.id}) is Michael's parent: #{michael.relationships.exists?(relative_id: john.id, relationship_type: 'parent')}"
puts "Michael Doe (#{michael.id}) is John's child: #{john.relationships.exists?(relative_id: michael.id, relationship_type: 'child')}"

# Remove the bidirectional parent-child relationship between John and Michael
begin
  ActiveRecord::Base.transaction do
    # Remove Michael -> John (parent) relationship
    michael_to_john = michael.relationships.find_by(relative_id: john.id, relationship_type: 'parent')
    if michael_to_john
      michael_to_john.destroy!
      puts "✓ Removed Michael -> John parent relationship"
    else
      puts "- Michael -> John parent relationship not found"
    end
    
    # Remove John -> Michael (child) relationship
    john_to_michael = john.relationships.find_by(relative_id: michael.id, relationship_type: 'child')
    if john_to_michael
      john_to_michael.destroy!
      puts "✓ Removed John -> Michael child relationship"
    else
      puts "- John -> Michael child relationship not found"
    end
    
    puts "\n✅ Successfully removed parent-child relationship between John and Michael"
  end
rescue => e
  puts "❌ Error removing relationships: #{e.message}"
end

puts "\n=== Verification After Fix ==="

# Verify the fix
alice = Person.find_by(id: 3)
lisa = Person.find_by(id: 12)

puts "Alice's parents: #{alice.parents.map(&:full_name)}"
puts "Michael's parents: #{michael.parents.map(&:full_name)}"
puts "John's children: #{john.children.map(&:full_name)}"
puts "Lisa's children: #{lisa.children.map(&:full_name)}"

# Check sibling relationships
alice_biological_siblings = alice.siblings
puts "\nAlice's biological siblings: #{alice_biological_siblings.map(&:full_name)}"

michael_in_biological_siblings = alice_biological_siblings.include?(michael)
puts "Michael in Alice's biological siblings: #{michael_in_biological_siblings ? '❌ STILL WRONG' : '✅ CORRECT'}"

puts "\n=== Expected Outcome ==="
puts "After this fix:"
puts "- Alice and Michael share NO biological parents"
puts "- Michael is Lisa's child from a previous relationship"
puts "- Lisa is married to John (Alice's father)"
puts "- Therefore, Michael is Alice's STEP-brother through Lisa's marriage to John"