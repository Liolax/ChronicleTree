puts "=== DATABASE STATE VERIFICATION ==="

# Check key people
charlie = Person.find_by(first_name: 'Charlie')
alice = Person.find_by(first_name: 'Alice')
david = Person.find_by(first_name: 'David')

puts "\n=== KEY PEOPLE ==="
puts "Charlie: #{charlie.first_name} #{charlie.last_name} (id: #{charlie.id})"
puts "Alice:   #{alice.first_name} #{alice.last_name} (id: #{alice.id})" 
puts "David:   #{david.first_name} #{david.last_name} (id: #{david.id})"

puts "\n=== CHARLIE'S FAMILY ==="
puts "Charlie's parents:"
charlie.parents.each { |p| puts "  - #{p.first_name} #{p.last_name}" }

puts "Charlie's siblings:"
charlie.siblings.each { |s| puts "  - #{s.first_name} #{s.last_name}" }

puts "Charlie's children:"
charlie.children.each { |c| puts "  - #{c.first_name} #{c.last_name}" }
puts "  (none)" if charlie.children.empty?

puts "\n=== ALICE-DAVID RELATIONSHIP STATUS ==="
# Check if Alice and David are ex-spouses
alice_to_david = Relationship.find_by(person: alice, relative: david, relationship_type: 'spouse')
david_to_alice = Relationship.find_by(person: david, relative: alice, relationship_type: 'spouse')

if alice_to_david
  puts "Alice -> David: spouse (is_ex: #{alice_to_david.is_ex})"
else
  puts "Alice -> David: no spouse relationship found"
end

if david_to_alice  
  puts "David -> Alice: spouse (is_ex: #{david_to_alice.is_ex})"
else
  puts "David -> Alice: no spouse relationship found"
end

puts "\n=== EXPECTED RESULTS ==="
puts "✅ Alice and David should be ex-spouses (is_ex: true)"
puts "✅ David should be 'Unrelated' to Charlie (not brother-in-law)"
puts "✅ Charlie should show proper family relationships to John, Jane, Alice"
