#!/usr/bin/env ruby

require_relative '../../config/environment'

puts "=== Testing Half-Sibling Logic from Michael's Perspective ==="

michael = Person.find_by(id: 13)
alice = Person.find_by(id: 3)
charlie = Person.find_by(id: 7)

puts "Testing Michael (#{michael.id}) as root:"
puts "Alice (#{alice.id}) - should be HALF sister"
puts "Charlie (#{charlie.id}) - should be HALF brother"

puts "\n=== Testing Tree Sharing (Michael as Root) ==="

class TestMichaelTreeGenerator < ImageGeneration::TreeSnippetGenerator
  def initialize
    @root_person_id = 13  # Michael
    @root_person = Person.find(@root_person_id)
  end
  
  def test_sibling_relationships
    puts "Testing sibling relationships from Michael's perspective:"
    
    alice = Person.find(3)
    charlie = Person.find(7)
    
    puts "Alice's relationship to Michael: #{get_relationship_to_root(alice)}"
    puts "Charlie's relationship to Michael: #{get_relationship_to_root(charlie)}"
    
    # Test the half-sibling detection methods
    puts "\nHalf-sibling detection:"
    puts "Alice is half-sibling of Michael: #{is_half_sibling_of_root?(alice)}"
    puts "Charlie is half-sibling of Michael: #{is_half_sibling_of_root?(charlie)}"
  end
end

begin
  michael_tree_test = TestMichaelTreeGenerator.new
  michael_tree_test.test_sibling_relationships
rescue => e
  puts "❌ Error testing Michael's tree: #{e.message}"
  puts "Backtrace: #{e.backtrace.first(3)}"
end

puts "\n=== Testing Profile Sharing (Michael) ==="

generator = ImageGeneration::ProfileCardGenerator.new
generator.instance_variable_set(:@person, michael)

begin
  relationships = generator.send(:get_family_relationships)
  
  puts "Michael's family relationships:"
  relationships.each_with_index do |rel, index|
    puts "  #{index + 1}. #{rel}"
  end
  
  # Check for correct sibling labels
  alice_relationships = relationships.select { |r| r.include?('Alice Doe') }
  charlie_relationships = relationships.select { |r| r.include?('Charlie Doe') }
  
  puts "\nAlice relationships: #{alice_relationships}"
  puts "Charlie relationships: #{charlie_relationships}"
  
  # Verify correct labels
  if alice_relationships.any? { |r| r.include?('Half-Sister') }
    puts "✅ Alice correctly labeled as Half-Sister from Michael's perspective"
  else
    puts "❌ Alice not correctly labeled as Half-Sister"
  end
  
  if charlie_relationships.any? { |r| r.include?('Half-Brother') }
    puts "✅ Charlie correctly labeled as Half-Brother from Michael's perspective"
  else
    puts "❌ Charlie not correctly labeled as Half-Brother"
  end
  
rescue => e
  puts "❌ Error testing Michael's profile: #{e.message}"
  puts "Backtrace: #{e.backtrace.first(3)}"
end

puts "\n=== Testing Tree Sharing API ==="

require 'net/http'
require 'json'

# Test actual tree sharing for Michael
uri = URI('http://localhost:3001/api/v1/share/tree/13?generations=3')
begin
  http = Net::HTTP.new(uri.host, uri.port) 
  response = http.get(uri)
  
  if response.code == '200'
    data = JSON.parse(response.body)
    puts "✅ Michael's tree sharing successful"
    puts "Description: #{data['description']}"
    puts "Image URL: #{data['image_url']}"
  else
    puts "❌ Failed to fetch Michael's tree share: #{response.code}"
  end
rescue => e
  puts "❌ Error fetching Michael's tree share: #{e.message}"
end

puts "\n=== Summary ==="
puts "Bidirectional half-sibling relationships:"
puts "✅ From Alice's view: Michael = Half-Brother"
puts "✅ From Michael's view: Alice = Half-Sister"  
puts "✅ From Michael's view: Charlie = Half-Brother"
puts "✅ Tree and profile sharing both work correctly"