charlie = Person.find_by(first_name: 'Charlie')
alice = Person.find_by(first_name: 'Alice')
john = Person.find_by(first_name: 'John')
jane = Person.find_by(first_name: 'Jane')

puts "=== RELATIONSHIP DEBUG ==="
puts "Charlie ID: #{charlie.id}"
puts "Alice ID: #{alice.id}"
puts "John ID: #{john.id}"
puts "Jane ID: #{jane.id}"

puts "\n=== CHARLIE'S PARENT RELATIONSHIPS ==="
charlie_parent_rels = Relationship.where(person: charlie, relationship_type: 'child')
charlie_parent_rels.each do |rel|
  parent = Person.find(rel.relative_id)
  puts "Charlie (#{charlie.id}) -> #{parent.first_name} (#{parent.id}): child"
end

puts "\n=== ALICE'S PARENT RELATIONSHIPS ==="
alice_parent_rels = Relationship.where(person: alice, relationship_type: 'child')
alice_parent_rels.each do |rel|
  parent = Person.find(rel.relative_id)
  puts "Alice (#{alice.id}) -> #{parent.first_name} (#{parent.id}): child"
end

puts "\n=== CHECKING SIBLING LOGIC ==="
charlie_parent_ids = charlie.parents.pluck(:id)
puts "Charlie's parent IDs: #{charlie_parent_ids}"

# Manually run the siblings query for Charlie
sibling_candidates = Person.joins(:relationships)
                          .where(relationships: { relationship_type: "child", relative_id: charlie_parent_ids })
                          .where.not(id: charlie.id)
                          .distinct

puts "Sibling candidates for Charlie:"
sibling_candidates.each do |person|
  puts "  #{person.first_name} #{person.last_name} (#{person.id})"
end
