# Debug script to see what's in connected_family
puts "Debugging connected family for generation issues..."

person = Person.first
puts "Root person: #{person.full_name}"

# Check all the family members that should exist
puts "\nAll family members in database for this user:"
person.user.people.each do |p|
  puts "- #{p.full_name} (born #{p.date_of_birth&.year || 'unknown'})"
end

# Test the tree generator's connected family method
generator = ImageGeneration::TreeSnippetGenerator.new
generator.instance_variable_set(:@root_person, person)
generator.instance_variable_set(:@generations, 5)
generator.instance_variable_set(:@include_step_relationships, true)

all_people = person.user.people.to_a
connected_family = generator.send(:collect_connected_family, all_people)

puts "\nPeople found by collect_connected_family method:"
connected_family.each do |p|
  puts "- #{p.full_name}"
end

puts "\nMissing from connected_family:"
missing = all_people - connected_family
missing.each do |p|
  puts "- #{p.full_name} (missing!)"
end

# Test finding specific generations
puts "\nTesting generation finding:"
[-2, -1, 0, 1, 2].each do |gen|
  found = generator.send(:find_people_in_generation, gen, connected_family)
  puts "Generation #{gen}: #{found.map(&:full_name).join(', ')}" if found.any?
end

# Test specific relationships manually
puts "\nManual relationship checks:"
puts "John's parents: #{person.parents.map(&:full_name).join(', ')}"
person.parents.each do |parent|
  puts "  #{parent.full_name}'s parents: #{parent.parents.map(&:full_name).join(', ')}"
end

puts "John's children: #{person.children.map(&:full_name).join(', ')}"
person.children.each do |child|
  puts "  #{child.full_name}'s children: #{child.children.map(&:full_name).join(', ')}"
end