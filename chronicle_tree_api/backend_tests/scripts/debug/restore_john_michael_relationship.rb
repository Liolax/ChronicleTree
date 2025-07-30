#!/usr/bin/env ruby

require_relative '../../config/environment'

puts "=== Restoring John-Michael Parent-Child Relationship ==="

john = Person.find_by(id: 1)
michael = Person.find_by(id: 13)

unless john && michael
  puts "Error: Could not find John or Michael"
  exit 1
end

puts "Restoring parent-child relationships to make Michael Alice's half-brother..."

begin
  ActiveRecord::Base.transaction do
    created_count = 0
    
    # Create John -> Michael (child) relationship
    john_to_michael = Relationship.find_or_create_by!(
      person: john, 
      relative: michael, 
      relationship_type: 'child'
    )
    created_count += 1 if john_to_michael.persisted?
    
    # Create Michael -> John (parent) relationship
    michael_to_john = Relationship.find_or_create_by!(
      person: michael, 
      relative: john, 
      relationship_type: 'parent'
    )
    created_count += 1 if michael_to_john.persisted?
    
    puts "Created/verified #{created_count} parent-child relationships"
  end
rescue => e
  puts "Error creating relationships: #{e.message}"
  exit 1
end

puts "\n=== Verification After Restoration ==="

alice = Person.find_by(id: 3)

# Check sibling relationships
alice_biological_siblings = alice.siblings
michael_in_biological_siblings = alice_biological_siblings.include?(michael)

puts "Michael in Alice's biological siblings: #{michael_in_biological_siblings ? 'CORRECT (half-siblings)' : 'MISSING'}"
puts "John's children count: #{john.children.count}"
puts "Michael's parents count: #{michael.parents.count}"

puts "\nExpected: Alice and Michael should be half-siblings (sharing father John)"