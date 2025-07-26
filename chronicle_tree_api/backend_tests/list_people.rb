#!/usr/bin/env ruby

require_relative 'chronicle_tree_api/config/environment'

people = Person.all
puts 'People in database:'
people.each do |p|
  puts "ID: #{p.id}, Name: #{p.full_name || p.name}, User: #{p.user_id}"
end

# Find Alice specifically
alice = people.find { |p| (p.full_name || p.name).include?('Alice') }
if alice
  puts "\nAlice found:"
  puts "ID: #{alice.id}, Name: #{alice.full_name || alice.name}"
  
  # Show her relationships
  puts "\nAlice's relationships:"
  alice.relationships.each do |rel|
    relative = Person.find_by(id: rel.relative_id)
    puts "  #{rel.relationship_type}: #{relative&.full_name || relative&.name} (ID: #{rel.relative_id})"
  end
else
  puts "\nAlice not found"
end