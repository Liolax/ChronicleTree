#!/usr/bin/env ruby

require_relative 'chronicle_tree_api/config/environment'
require 'net/http'
require 'json'

puts "=== Debugging Tree Generation for Alice ==="

# Test Alice's tree sharing API
uri = URI('http://localhost:3001/api/v1/share/tree/3?generations=4')
http = Net::HTTP.new(uri.host, uri.port)
response = http.get(uri)

if response.code == '200'
  data = JSON.parse(response.body)
  puts "✓ Tree sharing API successful"
  puts "Description: #{data['description']}"
  puts "\nImage path: #{data['image_path']}"
  
  # Let's also check what people are being included in the generations
  puts "\n=== Analyzing Tree Structure ==="
  
  # Let's manually trace the tree generation
  alice = Person.find_by(id: 3)
  
  # The tree generator should include people in different generations
  puts "Root person: #{alice.full_name} (ID: #{alice.id})"
  
  # Generation 0: Root
  puts "\nGeneration 0 (Root): #{alice.full_name}"
  
  # Generation -1: Parents
  parents = alice.parents
  puts "\nGeneration -1 (Parents):"
  parents.each { |p| puts "  #{p.full_name} (ID: #{p.id})" }
  
  # Generation -2: Grandparents
  puts "\nGeneration -2 (Grandparents):"
  grandparents = []
  parents.each do |parent|
    parent.parents.each do |gp|
      grandparents << gp
      puts "  #{gp.full_name} (ID: #{gp.id}) - Biological grandparent of #{alice.full_name}"
    end
    
    # Also check for spouses of parents (step-grandparents' children, i.e., step-parents)
    parent_spouses = parent.relationships.where(relationship_type: 'spouse', is_ex: false).map { |r| Person.find(r.relative_id) }
    parent_spouses.each do |spouse|
      next if parents.include?(spouse) # Skip if spouse is also Alice's parent
      
      puts "  #{spouse.full_name} (ID: #{spouse.id}) - Step-parent of #{alice.full_name}"
      
      # Check if this step-parent's parents should be shown
      spouse.parents.each do |step_gp|
        puts "    #{step_gp.full_name} (ID: #{step_gp.id}) - Step-grandparent of #{alice.full_name}"
      end
    end
  end
  
  # Let's see what the TreeSnippetGenerator actually includes
  puts "\n=== Testing TreeSnippetGenerator Person Inclusion ==="
  
  william = Person.find_by(id: 15)
  patricia = Person.find_by(id: 16)
  
  # Let's check the get_people_for_generation method
  # We'll need to look at the generator's logic
  
else
  puts "❌ Failed to fetch tree share: #{response.code} - #{response.body}"
end