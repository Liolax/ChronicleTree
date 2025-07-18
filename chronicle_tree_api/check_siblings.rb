charlie = Person.find_by(first_name: 'Charlie')
alice = Person.find_by(first_name: 'Alice')

puts "=== SIBLING RELATIONSHIP CHECK ==="
puts "Charlie siblings:"
charlie.siblings.each { |s| puts "  #{s.first_name} #{s.last_name}" }
puts "  (none)" if charlie.siblings.empty?

puts "Alice siblings:"
alice.siblings.each { |s| puts "  #{s.first_name} #{s.last_name}" }
puts "  (none)" if alice.siblings.empty?

puts "\n=== PARENT VERIFICATION ==="
puts "Charlie's parents: #{charlie.parents.map { |p| p.first_name }.join(', ')}"
puts "Alice's parents: #{alice.parents.map { |p| p.first_name }.join(', ')}"

# Check if they share parents
shared_parents = charlie.parents & alice.parents
puts "Shared parents: #{shared_parents.map { |p| p.first_name }.join(', ')}"
puts "Are they siblings? #{!shared_parents.empty?}"
