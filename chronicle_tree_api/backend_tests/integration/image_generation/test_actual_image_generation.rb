#!/usr/bin/env ruby

require_relative '../../config/environment'
require 'net/http'
require 'json'

puts "=== Testing Actual Image Generation ==="

# Get Alice's tree share with image generation
alice = Person.find_by(id: 3)
puts "Testing tree sharing for #{alice.full_name} (ID: #{alice.id})"

# Call the tree sharing endpoint
uri = URI('http://localhost:3001/api/v1/share/tree/3?generations=4')
http = Net::HTTP.new(uri.host, uri.port)
response = http.get(uri)

if response.code == '200'
  data = JSON.parse(response.body)
  puts "✓ Tree sharing API successful"
  
  image_path = data['image_path']
  puts "Generated image path: #{image_path}"
  
  if image_path && !image_path.empty?
    # The image was generated successfully
    puts "✓ Image generated successfully"
    
    # Check if the file exists
    full_path = File.join(Rails.root, 'public', image_path)
    if File.exist?(full_path)
      puts "✓ Image file exists at: #{full_path}"
      
      # Get file info
      file_size = File.size(full_path)
      puts "Image file size: #{file_size} bytes"
      
      if file_size > 0
        puts "✓ Image file has content"
      else
        puts "ERROR: Image file is empty"
      end
    else
      puts "ERROR: Image file does not exist at expected path"
    end
  else
    puts "ERROR: No image path returned"
  end
  
  puts "\nResponse data:"
  puts "Title: #{data['title']}"
  puts "Description: #{data['description']}"
  puts "Image URL: #{data['image_url']}"
  
else
  puts "ERROR: Failed to fetch tree share: #{response.code}"
  puts "Response body: #{response.body}"
end

puts "\n=== Testing Tree Generation Logic Directly ==="

# Test the tree generator directly
begin
  generator = ImageGeneration::TreeSnippetGenerator.new
  result = generator.generate(alice, generations: 4)
  
  puts "✓ TreeSnippetGenerator executed successfully"
  puts "Result type: #{result.class}"
  
  if result.is_a?(Hash)
    puts "Image path from generator: #{result[:image_path]}"
    puts "Generation time: #{result[:generation_time_ms]}ms"
  end
  
rescue => e
  puts "ERROR: Error with TreeSnippetGenerator: #{e.message}"
  puts "Backtrace: #{e.backtrace.first(5)}"
end

puts "\n=== Manual Relationship Testing ==="

# Test the relationship detection for William and Patricia directly
william = Person.find_by(id: 15)
patricia = Person.find_by(id: 16)

# Create a generator instance to test the methods
class TestGenerator < ImageGeneration::TreeSnippetGenerator
  def initialize
    @root_person_id = 3
    @root_person = Person.find(@root_person_id)
  end
  
  def test_relationships
    puts "Testing relationships from TreeSnippetGenerator perspective:"
    
    william = Person.find(15)
    patricia = Person.find(16)
    
    puts "William's relationship to Alice: #{get_relationship_to_root(william)}"
    puts "Patricia's relationship to Alice: #{get_relationship_to_root(patricia)}"
    
    # Test if they're detected as step-grandparents
    puts "William is_step_grandparent_of_root?: #{is_step_grandparent_of_root?(william)}"
    puts "Patricia is_step_grandparent_of_root?: #{is_step_grandparent_of_root?(patricia)}"
    
    # Check generation inclusion
    generation_minus_2 = find_people_in_generation(-2)
    puts "People in Generation -2: #{generation_minus_2.map(&:full_name)}"
    
    puts "William included in Generation -2: #{generation_minus_2.include?(william)}"
    puts "Patricia included in Generation -2: #{generation_minus_2.include?(patricia)}"
  end
end

begin
  test_gen = TestGenerator.new
  test_gen.test_relationships
rescue => e
  puts "ERROR: Error testing relationships: #{e.message}"
end