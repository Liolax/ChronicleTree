# Debug script to check Rails data
puts '=== PERSON IDS AND NAMES ==='
Person.all.each do |p|
  puts "#{p.id}: #{p.first_name} #{p.last_name}"
end

puts "\n=== RELATIONSHIPS ==="
Relationship.all.each do |r|
  person_name = "#{r.person.first_name} #{r.person.last_name}"
  relative_name = "#{r.relative.first_name} #{r.relative.last_name}"
  puts "#{r.person_id} (#{person_name}) -> #{r.relative_id} (#{relative_name}): #{r.relationship_type}"
end

puts "\n=== EMILY ANDERSON SPECIFIC ==="
emily = Person.find_by(first_name: 'Emily', last_name: 'Anderson')
if emily
  puts "Emily ID: #{emily.id}"
  puts "Emily parents: #{emily.parents.map { |p| "#{p.id} (#{p.first_name} #{p.last_name})" }}"
end

puts "\n=== MICHAEL DOE SPECIFIC ==="
michael = Person.find_by(first_name: 'Michael', last_name: 'Doe')
if michael
  puts "Michael ID: #{michael.id}"
  puts "Michael parents: #{michael.parents.map { |p| "#{p.id} (#{p.first_name} #{p.last_name})" }}"
end