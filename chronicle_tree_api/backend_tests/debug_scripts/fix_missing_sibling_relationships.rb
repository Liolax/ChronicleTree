#!/usr/bin/env ruby

require_relative '../../config/environment'

puts "=== Fixing Missing Sibling Relationships ==="

alice = Person.find_by(id: 3)
charlie = Person.find_by(id: 7)
michael = Person.find_by(id: 13)

unless alice && charlie && michael
  puts "Error: Could not find Alice, Charlie, or Michael"
  exit 1
end

puts "\n=== Checking Missing Sibling Relationships ==="

# Check existing relationships
alice_michael_1 = Relationship.find_by(person: alice, relative: michael, relationship_type: 'sibling')
alice_michael_2 = Relationship.find_by(person: michael, relative: alice, relationship_type: 'sibling')
charlie_michael_1 = Relationship.find_by(person: charlie, relative: michael, relationship_type: 'sibling')
charlie_michael_2 = Relationship.find_by(person: michael, relative: charlie, relationship_type: 'sibling')

missing_relationships = []
missing_relationships << [:alice, :michael] unless alice_michael_1 && alice_michael_2
missing_relationships << [:charlie, :michael] unless charlie_michael_1 && charlie_michael_2

puts "Found #{missing_relationships.length} missing sibling relationship pairs"

puts "\n=== Creating Missing Sibling Relationships ==="

begin
  ActiveRecord::Base.transaction do
    created_count = 0
    
    # Alice <-> Michael sibling relationships
    unless alice_michael_1
      Relationship.create!(person: alice, relative: michael, relationship_type: 'sibling')
      created_count += 1
    end
    
    unless alice_michael_2
      Relationship.create!(person: michael, relative: alice, relationship_type: 'sibling')
      created_count += 1
    end
    
    # Charlie <-> Michael sibling relationships
    unless charlie_michael_1
      Relationship.create!(person: charlie, relative: michael, relationship_type: 'sibling')
      created_count += 1
    end
    
    unless charlie_michael_2
      Relationship.create!(person: michael, relative: charlie, relationship_type: 'sibling')
      created_count += 1
    end
    
    puts "Created #{created_count} missing sibling relationships"
  end
rescue => e
  puts "Error creating sibling relationships: #{e.message}"
  exit 1
end

puts "\n=== Verification ==="

# Reload and check
alice.reload
charlie.reload
michael.reload

puts "Alice's siblings after fix: #{alice.siblings.count}"
puts "Charlie's siblings after fix: #{charlie.siblings.count}"
puts "Michael's siblings after fix: #{michael.siblings.count}"

# Simple verification that relationships were created correctly
michael_is_alice_sibling = alice.siblings.include?(michael)
michael_is_charlie_sibling = charlie.siblings.include?(michael)

puts "Michael is Alice's sibling: #{michael_is_alice_sibling ? 'YES' : 'NO'}"
puts "Michael is Charlie's sibling: #{michael_is_charlie_sibling ? 'YES' : 'NO'}"
puts "Sibling relationships have been #{(michael_is_alice_sibling && michael_is_charlie_sibling) ? 'successfully created' : 'not properly created'}"