puts "=== ALL RELATIONSHIPS IN DATABASE ==="
Relationship.all.each do |r|
  person = Person.find(r.person_id)
  relative = Person.find(r.relative_id)
  puts "#{person.first_name} (#{r.person_id}) -> #{relative.first_name} (#{r.relative_id}): #{r.relationship_type} (ex: #{r.is_ex})"
end

puts "\n=== PEOPLE IN DATABASE ==="
Person.all.each do |p|
  puts "#{p.first_name} #{p.last_name} (id: #{p.id})"
end
