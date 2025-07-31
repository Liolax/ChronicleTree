#!/usr/bin/env ruby

require_relative '../../config/environment'
require 'net/http'
require 'json'

puts "=== Testing Profile Sharing for Step-Relatives ==="

# Test Alice's profile sharing
alice = Person.find_by(id: 3)
puts "Testing profile sharing for #{alice.full_name} (ID: #{alice.id})"

# Call the profile sharing endpoint
uri = URI('http://localhost:3001/api/v1/share/profile/3')
http = Net::HTTP.new(uri.host, uri.port)
response = http.get(uri)

if response.code == '200'
  data = JSON.parse(response.body)
  puts "✓ Profile sharing API successful"
  
  puts "Title: #{data['title']}"
  puts "Description: #{data['description']}"
  puts "Image URL: #{data['image_url']}"
  
  image_path = data['image_path']
  puts "Generated image path: #{image_path}"
  
  if image_path && !image_path.empty?
    puts "✓ Image generated successfully"
    
    # Check if the file exists
    full_path = File.join(Rails.root, 'public', image_path)
    if File.exist?(full_path)
      puts "✓ Image file exists at: #{full_path}"
      file_size = File.size(full_path)
      puts "Image file size: #{file_size} bytes"
    else
      puts "ERROR: Image file does not exist"
    end
  else
    puts "ERROR: No image path returned"
  end
  
else
  puts "ERROR: Failed to fetch profile share: #{response.code}"
  puts "Response body: #{response.body}"
end

puts "\n=== Testing Profile Generation Logic Directly ==="

# Test the profile generator directly
begin
  generator = ImageGeneration::ProfileCardGenerator.new
  result = generator.generate(alice)
  
  puts "✓ ProfileCardGenerator executed successfully"
  puts "Result type: #{result.class}"
  
  if result.is_a?(String)
    puts "Generated image path: #{result}"
  end
  
rescue => e
  puts "ERROR: Error with ProfileCardGenerator: #{e.message}"
  puts "Backtrace: #{e.backtrace.first(5)}"
end

puts "\n=== Testing Expected Step-Relatives for Alice ==="

# List Alice's expected step-relatives
puts "Alice's expected step-relatives:"

# Step-mother: Lisa
lisa = Person.find_by(id: 12)
puts "- Step-mother: #{lisa.full_name} (ID: #{lisa.id})"

# Step-brother: Michael (Lisa's son, not biologically related to Alice)
michael = Person.find_by(id: 13)
if michael
  puts "- Step-brother: #{michael.full_name} (ID: #{michael.id})"
end

# Step-grandparents: William and Patricia (Lisa's parents)
william = Person.find_by(id: 15)
patricia = Person.find_by(id: 16)
puts "- Step-grandfather: #{william.full_name} (ID: #{william.id})"
puts "- Step-grandmother: #{patricia.full_name} (ID: #{patricia.id})"

puts "\n=== Testing Profile Generator's Family Relationships ==="

# Check what the profile generator includes
class TestProfileGenerator < ImageGeneration::ProfileCardGenerator
  def test_family_relationships(person)
    puts "Testing get_family_relationships for #{person.full_name}:"
    
    # This will call the internal method to get relationships
    relationships = get_family_relationships(person)
    
    puts "Family relationships found:"
    relationships.each_with_index do |rel, index|
      puts "  #{index + 1}. #{rel}"
    end
    
    # Check if step-relatives are included
    step_relations = relationships.select { |r| r.include?('Step-') }
    puts "\nStep-relationships found: #{step_relations.length}"
    step_relations.each { |rel| puts "  - #{rel}" }
    
    if step_relations.empty?
      puts "ERROR: No step-relationships found in profile!"
    else
      puts "✓ Step-relationships are included"
    end
    
    relationships
  end
end

begin
  test_profile_gen = TestProfileGenerator.new
  test_profile_gen.test_family_relationships(alice)
rescue => e
  puts "ERROR: Error testing profile relationships: #{e.message}"
  puts "Backtrace: #{e.backtrace.first(3)}"
end