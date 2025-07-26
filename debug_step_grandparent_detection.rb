#!/usr/bin/env ruby

require_relative 'chronicle_tree_api/config/environment'

puts "=== Debugging Step-Grandparent Detection in Tree Sharing ==="

# Focus on Alice (ID: 3) and the problematic step-grandparents
alice = Person.find_by(id: 3)
william = Person.find_by(id: 15)  # Should be step-grandfather
patricia = Person.find_by(id: 16) # Should be step-grandmother

puts "\nTesting for Alice Doe (ID: #{alice.id})"
puts "William O'Sullivan (ID: #{william.id}) - Expected: Step-Grandfather"
puts "Patricia Smith (ID: #{patricia.id}) - Expected: Step-Grandmother"

# Let's directly test the step-grandparent detection method
puts "\n=== Testing TreeSnippetGenerator Logic ==="

# Create a tree generator instance
generator_class = ImageGeneration::TreeSnippetGenerator
puts "Testing TreeSnippetGenerator methods..."

# We need to simulate the context of the generator
# Let's examine what methods exist in the generator
generator_methods = generator_class.instance_methods(false)
puts "Available methods: #{generator_methods}"

# Load the actual generator service to test its methods
require_relative 'chronicle_tree_api/app/services/image_generation/tree_snippet_generator'

# Create test instance
class TestTreeGenerator < ImageGeneration::TreeSnippetGenerator
  def initialize
    @root_person_id = 3  # Alice
    @root_person = Person.find(@root_person_id)
  end
  
  def test_step_grandparent_detection
    puts "\n=== Testing Step-Grandparent Detection Methods ==="
    
    # Test William (ID: 15)
    puts "Testing William O'Sullivan (ID: 15):"
    william = Person.find(15)
    
    puts "  is_step_grandparent_of_root?(william): #{is_step_grandparent_of_root?(william)}"
    if respond_to?(:get_step_grandparent_type)
      puts "  get_step_grandparent_type(william): #{get_step_grandparent_type(william)}"
    end
    
    # Test Patricia (ID: 16)
    puts "Testing Patricia Smith (ID: 16):"
    patricia = Person.find(16)
    
    puts "  is_step_grandparent_of_root?(patricia): #{is_step_grandparent_of_root?(patricia)}"
    if respond_to?(:get_step_grandparent_type)
      puts "  get_step_grandparent_type(patricia): #{get_step_grandparent_type(patricia)}"
    end
    
    # Test the relationship determination
    puts "\n=== Testing get_relationship_to_root ==="
    puts "  William's relationship to Alice: #{get_relationship_to_root(william)}"
    puts "  Patricia's relationship to Alice: #{get_relationship_to_root(patricia)}"
  end
end

begin
  test_generator = TestTreeGenerator.new
  test_generator.test_step_grandparent_detection
rescue => e
  puts "Error testing generator: #{e.message}"
  puts "Backtrace: #{e.backtrace.first(5)}"
end

puts "\n=== Manual Step-Grandparent Chain Verification ==="

# Let's manually verify the step-grandparent chain
# Alice -> John (father) -> Lisa (step-mother) -> William/Patricia (step-grandparents)

john = Person.find_by(id: 1)   # Alice's father
lisa = Person.find_by(id: 12)  # John's current wife

puts "Chain verification:"
puts "1. Alice (#{alice.id}) -> parent -> John (#{john.id})"
alice_to_john = alice.relationships.find_by(relative_id: john.id, relationship_type: 'parent')
puts "   Relationship exists: #{alice_to_john.present?}"

puts "2. John (#{john.id}) -> spouse -> Lisa (#{lisa.id})"
john_to_lisa = john.relationships.find_by(relative_id: lisa.id, relationship_type: 'spouse', is_ex: [false, nil])
puts "   Marriage exists and not ex: #{john_to_lisa.present?}"
puts "   Marriage details: #{john_to_lisa&.attributes}"

puts "3. Lisa (#{lisa.id}) -> parent -> William (#{william.id})"
lisa_to_william = lisa.relationships.find_by(relative_id: william.id, relationship_type: 'parent')
puts "   Parent relationship exists: #{lisa_to_william.present?}"

puts "4. Lisa (#{lisa.id}) -> parent -> Patricia (#{patricia.id})"
lisa_to_patricia = lisa.relationships.find_by(relative_id: patricia.id, relationship_type: 'parent')
puts "   Parent relationship exists: #{lisa_to_patricia.present?}"

# Check if any of these relationships are marked as deceased or ex
puts "\nRelationship status checks:"
puts "John-Lisa marriage is_ex: #{john_to_lisa&.is_ex}"
puts "John-Lisa marriage is_deceased: #{john_to_lisa&.is_deceased}"
puts "Lisa-William parent is_deceased: #{lisa_to_william&.is_deceased}"
puts "Lisa-Patricia parent is_deceased: #{lisa_to_patricia&.is_deceased}"

puts "\n=== Testing Tree Sharing API Response ==="

require 'net/http'
require 'json'

uri = URI('http://localhost:3001/api/v1/share/tree/3?generations=4')
begin
  http = Net::HTTP.new(uri.host, uri.port)
  response = http.get(uri)
  
  if response.code == '200'
    data = JSON.parse(response.body)
    puts "Tree sharing response received"
    puts "Description: #{data['description']}"
    
    # Look for William and Patricia in the description
    if data['description'].include?('William O\'Sullivan')
      puts "✓ William found in description"
      if data['description'].include?('Step-Grandfather')
        puts "✓ William correctly labeled as Step-Grandfather"
      else
        puts "❌ William NOT labeled as Step-Grandfather"
      end
    else
      puts "❌ William not found in description"
    end
    
    if data['description'].include?('Patricia Smith')
      puts "✓ Patricia found in description"
      if data['description'].include?('Step-Grandmother')
        puts "✓ Patricia correctly labeled as Step-Grandmother"
      else
        puts "❌ Patricia NOT labeled as Step-Grandmother"
      end
    else
      puts "❌ Patricia not found in description"
    end
    
  else
    puts "❌ Failed to fetch tree share: #{response.code} - #{response.body}"
  end
rescue => e
  puts "❌ Error fetching tree share: #{e.message}"
end