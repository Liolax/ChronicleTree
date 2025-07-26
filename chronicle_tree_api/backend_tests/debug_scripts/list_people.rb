#!/usr/bin/env ruby

require_relative '../../config/environment'

people = Person.all
puts "Total people in database: #{people.count}"

puts "\nPeople list:"
people.each do |p|
  puts "#{p.id}: #{p.full_name || p.name}"
end

# Find Alice specifically
alice = people.find { |p| (p.full_name || p.name).include?('Alice') }
if alice
  puts "\nAlice's relationships (#{alice.relationships.count}):"
  alice.relationships.each do |rel|
    relative = Person.find_by(id: rel.relative_id)
    puts "  #{rel.relationship_type}: #{relative&.full_name || relative&.name}"
  end
else
  puts "\nAlice not found in database"
end