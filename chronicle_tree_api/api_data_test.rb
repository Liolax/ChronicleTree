puts "=== API DATA TEST ==="

charlie = Person.find_by(first_name: 'Charlie')
puts "Charlie: #{charlie.inspect}"

puts "\n=== CHECKING SERIALIZER OUTPUT ==="
# Let's see what the PersonSerializer would return
# We need to check what data the API sends

puts "\n=== RAW RELATIONSHIP DATA ==="
puts "Charlie's relationships from database:"
charlie.relationships.each do |rel|
  relative = Person.find(rel.relative_id)
  puts "  #{charlie.first_name} -> #{relative.first_name}: #{rel.relationship_type} (ex: #{rel.is_ex})"
end

puts "\n=== REVERSE RELATIONSHIPS ==="  
puts "Relationships TO Charlie:"
charlie.related_by_relationships.each do |rel|
  person = Person.find(rel.person_id)
  puts "  #{person.first_name} -> #{charlie.first_name}: #{rel.relationship_type} (ex: #{rel.is_ex})"
end

puts "\n=== ALL PEOPLE DATA ==="
Person.all.each do |person|
  puts "#{person.first_name} #{person.last_name}: id=#{person.id}, user_id=#{person.user_id}"
end
