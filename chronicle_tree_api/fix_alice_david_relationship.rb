# Fix the Alice-David relationship to be ex-spouses as intended
alice = Person.find_by(first_name: 'Alice')
david = Person.find_by(first_name: 'David')

puts "=== FIXING ALICE-DAVID RELATIONSHIP ==="
puts "Before fix:"
alice_to_david = alice.relationships.find_by(relative_id: david.id, relationship_type: 'spouse')
david_to_alice = david.relationships.find_by(relative_id: alice.id, relationship_type: 'spouse')

puts "Alice -> David is_ex: #{alice_to_david.is_ex}"
puts "David -> Alice is_ex: #{david_to_alice.is_ex}"

# Update to ex-spouses
alice_to_david.update!(is_ex: true)
david_to_alice.update!(is_ex: true)

puts "\nAfter fix:"
alice_to_david.reload
david_to_alice.reload
puts "Alice -> David is_ex: #{alice_to_david.is_ex}"
puts "David -> Alice is_ex: #{david_to_alice.is_ex}"

puts "\n✅ Alice and David are now correctly marked as ex-spouses"
puts "Expected result: David should now be 'Unrelated' to Charlie"
