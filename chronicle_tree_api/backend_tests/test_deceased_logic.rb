#!/usr/bin/env ruby
# Test script for deceased spouse relationship logic

require_relative 'config/environment'

puts "=== Testing Deceased Spouse Profile Logic ==="
puts

# Create test user  
user = User.find_or_create_by!(email: 'test_deceased@example.com') do |u|
  u.password = 'password123'
  u.name = 'Test User'
end

# Clean up existing data
user.people.destroy_all

# Create people
john = Person.create!(first_name: 'John', last_name: 'Doe', user: user, gender: 'Male', is_deceased: false)
jane = Person.create!(first_name: 'Jane', last_name: 'Smith', user: user, gender: 'Female', is_deceased: true, date_of_death: '2022-01-01')

# Jane's parents
richard = Person.create!(first_name: 'Richard', last_name: 'Smith', user: user, gender: 'Male', is_deceased: false)
margaret = Person.create!(first_name: 'Margaret', last_name: 'Smith', user: user, gender: 'Female', is_deceased: false)

# Set up parent relationships
Relationship.create!(person: jane, relative: richard, relationship_type: 'parent')
Relationship.create!(person: richard, relative: jane, relationship_type: 'child')
Relationship.create!(person: jane, relative: margaret, relationship_type: 'parent')
Relationship.create!(person: margaret, relative: jane, relationship_type: 'child')

# Set up marriage relationship
Relationship.create!(person: john, relative: jane, relationship_type: 'spouse', is_ex: false, is_deceased: false)
Relationship.create!(person: jane, relative: john, relationship_type: 'spouse', is_ex: false, is_deceased: false)

puts "Test Setup Complete:"
puts "- John Doe (alive) married to Jane Smith (deceased 2022-01-01)"  
puts "- Jane's parents: Richard Smith, Margaret Smith"
puts

puts "=== Testing John's Profile (Living Person) ==="
puts "John's current spouses: #{john.current_spouses.pluck(:first_name)}"
puts "John's all spouses: #{john.all_spouses_including_deceased.pluck(:first_name)}"
puts "John's parents-in-law: #{john.parents_in_law.pluck(:first_name)}"
puts "Expected: John should NOT see Jane's parents as in-laws (per new logic)"
puts

puts "=== Testing Jane's Profile (Deceased Person) ==="
puts "Jane's current spouses: #{jane.current_spouses.pluck(:first_name)}"
puts "Jane's all spouses: #{jane.all_spouses_including_deceased.pluck(:first_name)}"
puts "Jane's parents-in-law: #{jane.parents_in_law.pluck(:first_name)}"
puts "Expected: Jane should have NO in-laws (deceased people don't show in-laws)"
puts

puts "=== Testing Relationship Serialization ==="
john_serializer = Api::V1::PersonSerializer.new(john)
jane_serializer = Api::V1::PersonSerializer.new(jane)

puts "John's relatives from serializer:"
john_serializer.relatives.each do |rel|
  puts "  - #{rel[:full_name]} (#{rel[:relationship_type]}#{rel[:is_ex] ? ', ex' : ''}#{rel[:is_deceased] ? ', deceased' : ''})"
end

puts "Jane's relatives from serializer:"
jane_serializer.relatives.each do |rel|
  puts "  - #{rel[:full_name]} (#{rel[:relationship_type]}#{rel[:is_ex] ? ', ex' : ''}#{rel[:is_deceased] ? ', deceased' : ''})"
end

# Clean up
user.destroy
puts "\nTest completed successfully!"
