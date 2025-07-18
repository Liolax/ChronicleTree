puts "=== API DATA FORMAT TEST ==="

# Test what the API actually sends
charlie = Person.find_by(first_name: 'Charlie')
puts "Charlie: #{charlie.first_name} #{charlie.last_name} (id: #{charlie.id})"

puts "\n=== CHECKING ACTUAL API SERIALIZATION ==="
# Check what PersonSerializer outputs (if it exists)
require 'json'

# Check if we can call the API endpoints directly
puts "\n=== TESTING RELATIONSHIP FORMAT IN API ==="
puts "Charlie's relationships from database:"
charlie.relationships.each do |rel|
  puts "  #{rel.person.first_name} -> #{rel.relative.first_name}: #{rel.relationship_type} (ex: #{rel.is_ex})"
end

puts "\nReverse relationships (TO Charlie):"
charlie.related_by_relationships.each do |rel|
  puts "  #{rel.person.first_name} -> #{rel.relative.first_name}: #{rel.relationship_type} (ex: #{rel.is_ex})"
end

puts "\n=== FRONTEND DATA EXPECTATIONS ==="
puts "Frontend expects relationships in this format:"
puts "{ source: 'person_id', target: 'relative_id', type: 'relationship_type', is_ex: boolean }"

puts "\n=== ACTUAL RELATIONSHIP DATA ==="
all_relationships = Relationship.all
puts "Total relationships: #{all_relationships.count}"
all_relationships.each do |rel|
  puts "  #{rel.person.first_name} (#{rel.person_id}) -> #{rel.relative.first_name} (#{rel.relative_id}): #{rel.relationship_type} (ex: #{rel.is_ex})"
end
