#!/usr/bin/env ruby

require_relative 'chronicle_tree_api/config/environment'

puts "=== Restoring John-Michael Parent-Child Relationship ==="

john = Person.find_by(id: 1)
michael = Person.find_by(id: 13)

puts "According to seeds.rb, Michael should be the son of BOTH John and Lisa"
puts "This makes Michael Alice's half-brother (not step-brother)"
puts "Restoring the correct parent-child relationships..."

begin
  ActiveRecord::Base.transaction do
    # Create John -> Michael (child) relationship
    john_to_michael = Relationship.find_or_create_by!(
      person: john, 
      relative: michael, 
      relationship_type: 'child'
    )
    puts "✓ Created John -> Michael (child) relationship"
    
    # Create Michael -> John (parent) relationship
    michael_to_john = Relationship.find_or_create_by!(
      person: michael, 
      relative: john, 
      relationship_type: 'parent'
    )
    puts "✓ Created Michael -> John (parent) relationship"
    
    puts "\n✅ Successfully restored parent-child relationship between John and Michael"
  end
rescue => e
  puts "❌ Error creating relationships: #{e.message}"
end

puts "\n=== Verification After Restoration ==="

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
puts "Michael in Alice's biological siblings: #{michael_in_biological_siblings ? '✅ CORRECT (half-siblings)' : '❌ MISSING'}"

puts "\n=== Correct Family Structure (Per Seeds) ==="
puts "John (father) married to:"
puts "  1. Jane (deceased) - mother of Alice & Charlie"
puts "  2. Lisa (current) - mother of Michael"
puts "Michael is the biological son of John & Lisa"
puts "Alice and Michael are HALF-SIBLINGS (share father John)"
puts "This is the intended family structure according to seeds.rb"

puts "\n=== Testing Michael's Tree View ==="
puts "When viewing Michael's family tree, John should now appear as 'Father', not 'Unrelated'"