puts "=== API DATA VERIFICATION ==="

charlie = Person.find_by(first_name: 'Charlie')
alice = Person.find_by(first_name: 'Alice')
david = Person.find_by(first_name: 'David')

puts "Charlie ID: #{charlie.id}"
puts "Alice-David relationship:"

alice_to_david = Relationship.find_by(person: alice, relative: david, relationship_type: 'spouse')
if alice_to_david
  puts "Alice -> David: spouse (is_ex: #{alice_to_david.is_ex})"
else
  puts "Alice -> David: no relationship found"
end

david_to_alice = Relationship.find_by(person: david, relative: alice, relationship_type: 'spouse')
if david_to_alice
  puts "David -> Alice: spouse (is_ex: #{david_to_alice.is_ex})"
else
  puts "David -> Alice: no relationship found"
end

puts "\n=== EXPECTED API RESPONSE FORMAT ==="
puts "When frontend requests Charlie's tree, David should show is_ex: true"
puts "This should make David appear as 'Unrelated' instead of 'Brother-in-law'"
