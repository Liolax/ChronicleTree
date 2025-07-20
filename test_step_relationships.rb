user = User.first
puts '=== API SERIALIZER TEST ==='
puts 'Testing full_tree endpoint data structure...'
puts ''

people = user.people.to_a
edges = []
people.each do |person|
  person.relationships.each do |rel|
    if people.map(&:id).include?(rel.relative_id)
      edge = {
        source: person.id,
        target: rel.relative_id,
        relationship_type: rel.relationship_type
      }
      if rel.relationship_type == 'spouse'
        edge[:is_ex] = rel.is_ex
        edge[:is_deceased] = rel.is_deceased
      end
      edges << edge
    end
  end
end

puts 'Total people: ' + people.count.to_s
puts 'Total edges: ' + edges.count.to_s
puts ''
puts 'Sample relationships:'
edges.select{|e| ['spouse', 'parent', 'child'].include?(e[:relationship_type])}.first(10).each do |edge|
  source_person = people.find{|p| p.id == edge[:source]}
  target_person = people.find{|p| p.id == edge[:target]}
  puts source_person.first_name + ' -> ' + edge[:relationship_type] + ' -> ' + target_person.first_name
end

puts ''
puts '=== STEP RELATIONSHIP SCENARIOS ==='
john = people.find{|p| p.first_name == 'John' && p.last_name == 'Doe'}
alice = people.find{|p| p.first_name == 'Alice'}
lisa = people.find{|p| p.first_name == 'Lisa'}
michael = people.find{|p| p.first_name == 'Michael'}

puts 'John-Lisa marriage: ' + edges.any?{|e| e[:source] == john.id && e[:target] == lisa.id && e[:relationship_type] == 'spouse'}.to_s
puts 'John-Alice parent: ' + edges.any?{|e| e[:source] == john.id && e[:target] == alice.id && e[:relationship_type] == 'child'}.to_s
puts 'Lisa-Alice NOT parent: ' + edges.any?{|e| e[:source] == lisa.id && e[:target] == alice.id && e[:relationship_type] == 'child'}.to_s
puts ''
puts 'This means: Alice should see Lisa as STEP-MOTHER'
puts 'And: Lisa should see Alice as STEP-DAUGHTER'