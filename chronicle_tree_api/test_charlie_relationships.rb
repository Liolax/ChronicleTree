puts "=== CHARLIE'S FAMILY RELATIONSHIPS TEST ==="

charlie = Person.find_by(first_name: 'Charlie')
puts "Testing from Charlie's perspective: #{charlie.first_name} #{charlie.last_name}"

# Get all people and show their relationships to Charlie
all_people = Person.all.where.not(id: charlie.id)

puts "\nAll relationships to Charlie:"
all_people.each do |person|
  relationship = person.relationship_to(charlie)
  puts "#{person.first_name} #{person.last_name}: #{relationship}"
end

puts "\n=== SPECIFICALLY CHECKING DAVID ==="
david = Person.find_by(first_name: 'David')
if david
  david_relationship = david.relationship_to(charlie)
  puts "David A's relationship to Charlie: #{david_relationship}"
  
  # Also check the reverse
  charlie_to_david = charlie.relationship_to(david)
  puts "Charlie's relationship to David: #{charlie_to_david}"
else
  puts "David not found"
end

puts "\n=== CHECKING ALICE (SISTER) ==="
alice = Person.find_by(first_name: 'Alice')
if alice
  alice_relationship = alice.relationship_to(charlie)
  puts "Alice A's relationship to Charlie: #{alice_relationship}"
  
  # Check Alice's current relationships
  puts "Alice's current spouses:"
  alice.spouses.each do |spouse|
    puts "  - #{spouse.first_name} #{spouse.last_name} (is_ex: #{Relationship.find_by(person: alice, related_person: spouse, relationship_type: 'spouse')&.is_ex})"
  end
end
