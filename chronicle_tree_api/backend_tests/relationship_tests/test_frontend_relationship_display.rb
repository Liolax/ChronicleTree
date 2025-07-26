#!/usr/bin/env ruby

require_relative '../../config/environment'
require 'net/http'
require 'json'

puts "=== Testing Frontend Relationship Display ==="

# Test the People API endpoint that provides data to the frontend
uri = URI('http://localhost:3001/api/v1/people')
http = Net::HTTP.new(uri.host, uri.port)

# We need to simulate authentication or use the actual endpoint
# For now, let's check what data is available directly

alice = Person.find_by(id: 3)
user = alice.user

# Get all people and relationships in the format the frontend expects
all_people = user.people.includes(:relationships).to_a

puts "People data (what frontend receives):"
all_people.select { |p| [1, 2, 3, 12, 13].include?(p.id) }.each do |person|
  puts "\nPerson: #{person.full_name} (ID: #{person.id})"
  puts "  Relationships:"
  person.relationships.each do |rel|
    relative = all_people.find { |p| p.id == rel.relative_id }
    status = ""
    status += " [EX]" if rel.is_ex
    status += " [DECEASED]" if rel.is_deceased  
    puts "    #{rel.relationship_type}: #{relative&.full_name}#{status}"
  end
end

# Test the actual API call format
puts "\n=== API Format Test ==="
puts "What the frontend receives for relationship calculation:"

relationships_array = []
all_people.each do |person|
  person.relationships.each do |rel|
    if all_people.map(&:id).include?(rel.relative_id)
      relationships_array << {
        source: person.id,
        target: rel.relative_id,
        relationship_type: rel.relationship_type,
        is_ex: rel.is_ex || false,
        is_deceased: rel.is_deceased || false
      }
    end
  end
end

puts "Relationships array (JSON format):"
puts JSON.pretty_generate(relationships_array.select { |r| 
  [1, 2, 3, 12, 13].include?(r[:source]) && [1, 2, 3, 12, 13].include?(r[:target])
})

# Test specific case: What should Alice see when looking at Michael?
puts "\n=== Alice's Perspective on Michael ==="
puts "According to relationship calculator logic:"
puts "1. Alice (3) has parents: John (1), Jane (2)"
puts "2. Michael (13) has parents: John (1), Lisa (12)"  
puts "3. They share parent John (1)"
puts "4. Since they share 1 parent but not all parents -> HALF-SIBLINGS"
puts "5. Since Michael is male -> Alice should see: 'Half-Brother'"

# Check what relationships Alice actually has recorded
puts "\nAlice's recorded sibling relationships:"
alice.relationships.where(relationship_type: 'sibling').each do |rel|
  sibling = Person.find_by(id: rel.relative_id)
  puts "  #{sibling.full_name} (#{sibling.gender || 'Unknown gender'})"
end

michael_relationship = alice.relationships.find { |r| r.relative_id == 13 }
puts "\nAlice -> Michael relationship in DB: #{michael_relationship ? michael_relationship.relationship_type : 'NONE'}"

if michael_relationship.nil?
  puts "❌ Missing: Alice and Michael don't have a sibling relationship recorded"
  puts "   The frontend relationship calculator should detect this as half-siblings"
  puts "   But it might not show in profile 'Relationships' section if not in DB"
end