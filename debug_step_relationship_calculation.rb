#!/usr/bin/env ruby

require_relative 'chronicle_tree_api/config/environment'

puts "=== Debugging Step-Relationship Calculation for Profile ==="

alice = Person.find_by(id: 3)
puts "Testing step-relationship calculation for #{alice.full_name}:"

# Create a profile generator to test the calculation method
generator = ImageGeneration::ProfileCardGenerator.new
generator.instance_variable_set(:@person, alice)

begin
  # Get the data needed for step relationship calculation
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
  
  puts "Total people in family: #{all_people.length}"
  puts "Total relationships: #{all_relationships.length}"
  
  # Call the step-relationship calculation method
  step_stats = generator.send(:calculate_step_relationships_for_profile, alice, all_people, all_relationships)
  
  puts "\n=== Step-Relationship Statistics ==="
  puts "Step-parents: #{step_stats[:step_parents].length}"
  step_stats[:step_parents].each do |sp|
    puts "  - #{sp[:full_name]} (ID: #{sp[:id]})"
  end
  
  puts "Step-children: #{step_stats[:step_children].length}"
  step_stats[:step_children].each do |sc|
    puts "  - #{sc[:full_name]} (ID: #{sc[:id]})"
  end
  
  puts "Step-siblings: #{step_stats[:step_siblings].length}"
  step_stats[:step_siblings].each do |ss|
    puts "  - #{ss[:full_name]} (ID: #{ss[:id]})"
  end
  
  puts "Step-grandparents: #{step_stats[:step_grandparents].length}"
  step_stats[:step_grandparents].each do |sg|
    puts "  - #{sg[:full_name]} (ID: #{sg[:id]})"
  end
  
  # Check if Michael (step-sibling) is included
  michael = Person.find_by(id: 13)
  michael_in_step_siblings = step_stats[:step_siblings].any? { |ss| ss[:id] == michael.id }
  puts "\nMichael Doe in step-siblings: #{michael_in_step_siblings ? '✓' : '❌'}"
  
  # Check if William/Patricia (step-grandparents) are included
  william = Person.find_by(id: 15)
  patricia = Person.find_by(id: 16)
  william_in_step_grandparents = step_stats[:step_grandparents].any? { |sg| sg[:id] == william.id }
  patricia_in_step_grandparents = step_stats[:step_grandparents].any? { |sg| sg[:id] == patricia.id }
  
  puts "William O'Sullivan in step-grandparents: #{william_in_step_grandparents ? '✓' : '❌'}"
  puts "Patricia Smith in step-grandparents: #{patricia_in_step_grandparents ? '✓' : '❌'}"
  
rescue => e
  puts "❌ Error: #{e.message}"
  puts "Backtrace:"
  e.backtrace.first(5).each { |line| puts "  #{line}" }
end

puts "\n=== Expected vs Actual ==="
puts "Expected step-relationships for Alice:"
puts "- Step-Mother: Lisa Doe ✓ (should be found)"
puts "- Step-Brother: Michael Doe (expected - Lisa's son)"
puts "- Step-Grandfather: William O'Sullivan (expected - Lisa's father)"
puts "- Step-Grandmother: Patricia Smith (expected - Lisa's mother)"