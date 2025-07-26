emily = Person.find_by(first_name: 'Emily', last_name: 'Anderson')
michael = Person.find_by(first_name: 'Michael', last_name: 'Doe')

puts '=== CURRENT SIBLING RELATIONSHIPS ==='
Relationship.where(relationship_type: 'sibling').each do |rel|
  puts "#{rel.person.first_name} #{rel.person.last_name} -> #{rel.relative.first_name} #{rel.relative.last_name}: sibling"
end

puts "\n=== ALICE AND MICHAEL RELATIONSHIP CHECK ==="
alice = Person.find_by(first_name: 'Alice', last_name: 'Doe')
alice_to_michael = Relationship.find_by(person: alice, relative: michael, relationship_type: 'sibling')
michael_to_alice = Relationship.find_by(person: michael, relative: alice, relationship_type: 'sibling')

puts "Alice -> Michael sibling relationship: #{alice_to_michael ? 'EXISTS' : 'REMOVED'}"
puts "Michael -> Alice sibling relationship: #{michael_to_alice ? 'EXISTS' : 'REMOVED'}"