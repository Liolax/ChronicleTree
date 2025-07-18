# Check the specific spouse relationship
alice = Person.find_by(first_name: 'Alice')
david = Person.find_by(first_name: 'David')

puts "=== ALICE-DAVID SPOUSE RELATIONSHIP DETAILS ==="
alice_to_david = alice.relationships.find_by(relative_id: david.id, relationship_type: 'spouse')
david_to_alice = david.relationships.find_by(relative_id: alice.id, relationship_type: 'spouse')

puts "Alice -> David: #{alice_to_david.inspect}"
puts "David -> Alice: #{david_to_alice.inspect}"

if alice_to_david
  puts "Alice -> David is_ex: #{alice_to_david.is_ex}"
end

if david_to_alice  
  puts "David -> Alice is_ex: #{david_to_alice.is_ex}"
end

puts "\n=== ALL SPOUSE RELATIONSHIPS IN DATABASE ==="
Relationship.where(relationship_type: 'spouse').each do |rel|
  person = Person.find(rel.person_id)
  relative = Person.find(rel.relative_id)
  puts "#{person.first_name} -> #{relative.first_name}: is_ex=#{rel.is_ex}"
end
