# Check for existing sibling relationships in the database
puts '=== CHECKING EXISTING SIBLING RELATIONSHIPS ==='
puts

# Find Alice, Michael, Charlie, Emily
alice = Person.find_by(first_name: 'Alice', last_name: 'Doe')
michael = Person.find_by(first_name: 'Michael', last_name: 'Doe') 
charlie = Person.find_by(first_name: 'Charlie', last_name: 'Doe')
emily = Person.find_by(first_name: 'Emily')

puts "Alice: #{alice&.id} (#{alice&.first_name} #{alice&.last_name})"
puts "Michael: #{michael&.id} (#{michael&.first_name} #{michael&.last_name})"
puts "Charlie: #{charlie&.id} (#{charlie&.first_name} #{charlie&.last_name})"
puts "Emily: #{emily&.id} (#{emily&.first_name} #{emily&.last_name})"
puts

if alice && michael
  # Check if there's a sibling relationship between Alice and Michael
  alice_michael = Relationship.find_by(person: alice, relative: michael, relationship_type: 'sibling')
  michael_alice = Relationship.find_by(person: michael, relative: alice, relationship_type: 'sibling')
  
  puts "Alice → Michael sibling relationship: #{alice_michael ? 'EXISTS' : 'NONE'}"
  puts "Michael → Alice sibling relationship: #{michael_alice ? 'EXISTS' : 'NONE'}"
  
  if alice_michael || michael_alice
    puts "ERROR: PROBLEM: Explicit sibling relationship exists between Alice and Michael"
    puts "This will cause Emily to see Michael as Uncle instead of Step-Uncle"
  else
    puts "SUCCESS: GOOD: No explicit sibling relationship between Alice and Michael"
  end
end

puts
puts '=== ALL SIBLING RELATIONSHIPS ==='
Relationship.where(relationship_type: 'sibling').includes(:person, :relative).each do |rel|
  puts "#{rel.person.first_name} #{rel.person.last_name} → #{rel.relative.first_name} #{rel.relative.last_name}"
end