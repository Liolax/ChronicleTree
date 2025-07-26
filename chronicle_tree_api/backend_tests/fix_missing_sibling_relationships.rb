#!/usr/bin/env ruby

require_relative 'chronicle_tree_api/config/environment'

puts "=== Fixing Missing Sibling Relationships ==="

alice = Person.find_by(id: 3)
charlie = Person.find_by(id: 7)
michael = Person.find_by(id: 13)

puts "Alice (#{alice.id}), Charlie (#{charlie.id}), Michael (#{michael.id})"

puts "\n=== Current Sibling Relationships in Database ==="
all_siblings = Relationship.where(relationship_type: 'sibling').includes(:person, :relative)
all_siblings.each do |rel|
  puts "#{rel.person.full_name} <-> #{rel.relative.full_name}"
end

puts "\n=== Missing Sibling Relationships ==="

# Alice and Michael should be siblings (they share father John)
alice_michael_1 = Relationship.find_by(person: alice, relative: michael, relationship_type: 'sibling')
alice_michael_2 = Relationship.find_by(person: michael, relative: alice, relationship_type: 'sibling')

puts "Alice -> Michael sibling: #{alice_michael_1 ? '✓' : '❌ MISSING'}"
puts "Michael -> Alice sibling: #{alice_michael_2 ? '✓' : '❌ MISSING'}"

# Charlie and Michael should be siblings (they share father John)
charlie_michael_1 = Relationship.find_by(person: charlie, relative: michael, relationship_type: 'sibling')
charlie_michael_2 = Relationship.find_by(person: michael, relative: charlie, relationship_type: 'sibling')

puts "Charlie -> Michael sibling: #{charlie_michael_1 ? '✓' : '❌ MISSING'}"
puts "Michael -> Charlie sibling: #{charlie_michael_2 ? '✓' : '❌ MISSING'}"

puts "\n=== Creating Missing Sibling Relationships ==="

begin
  ActiveRecord::Base.transaction do
    # Alice <-> Michael sibling relationships
    unless alice_michael_1
      Relationship.create!(person: alice, relative: michael, relationship_type: 'sibling')
      puts "✓ Created Alice -> Michael sibling relationship"
    end
    
    unless alice_michael_2
      Relationship.create!(person: michael, relative: alice, relationship_type: 'sibling')
      puts "✓ Created Michael -> Alice sibling relationship"
    end
    
    # Charlie <-> Michael sibling relationships
    unless charlie_michael_1
      Relationship.create!(person: charlie, relative: michael, relationship_type: 'sibling')
      puts "✓ Created Charlie -> Michael sibling relationship"
    end
    
    unless charlie_michael_2
      Relationship.create!(person: michael, relative: charlie, relationship_type: 'sibling')
      puts "✓ Created Michael -> Charlie sibling relationship"
    end
    
    puts "\n✅ All sibling relationships created successfully"
  end
rescue => e
  puts "❌ Error creating sibling relationships: #{e.message}"
end

puts "\n=== Verification ==="

# Reload and check
alice.reload
charlie.reload
michael.reload

puts "Alice's siblings: #{alice.siblings.map(&:full_name)}"
puts "Charlie's siblings: #{charlie.siblings.map(&:full_name)}"
puts "Michael's siblings: #{michael.siblings.map(&:full_name)}"

puts "\n=== Testing Step-Sibling Calculation Again ==="

# Test if Michael is still detected as step-sibling (he shouldn't be)
generator = ImageGeneration::ProfileCardGenerator.new
generator.instance_variable_set(:@person, alice)

all_people = alice.user.people.to_a
all_relationships = []

all_people.each do |person|
  person.relationships.each do |rel|
    if all_people.map(&:id).include?(rel.relative_id)
      all_relationships << {
        source: person.id,
        target: rel.relative_id,
        relationship_type: rel.relationship_type,
        is_ex: rel.is_ex || false,
        is_deceased: rel.is_deceased || false
      }
    end
  end
end

step_stats = generator.send(:calculate_step_relationships_for_profile, alice, all_people, all_relationships)

puts "Step-siblings found after fix: #{step_stats[:step_siblings].length}"
step_stats[:step_siblings].each do |ss|
  puts "  - #{ss[:full_name]} (ID: #{ss[:id]})"
end

if step_stats[:step_siblings].any? { |ss| ss[:id] == michael.id }
  puts "❌ Michael still detected as step-sibling - logic issue remains"
else
  puts "✅ Michael no longer detected as step-sibling - fixed!"
end