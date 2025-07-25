# Debug relationship calculation with actual Rails data
emily = Person.find_by(first_name: 'Emily', last_name: 'Anderson')
michael = Person.find_by(first_name: 'Michael', last_name: 'Doe')

puts "=== TESTING EMILY -> MICHAEL RELATIONSHIP ==="
puts "Emily ID: #{emily.id}, Michael ID: #{michael.id}"

# Get all people and relationships in Rails format
all_people = Person.all.map do |p|
  {
    id: p.id,
    first_name: p.first_name,
    last_name: p.last_name,
    gender: p.gender,
    date_of_birth: p.date_of_birth,
    date_of_death: p.date_of_death,
    is_deceased: p.is_deceased
  }
end

# Get all relationships in Rails format (edges)
relationships = []
Person.all.each do |person|
  person.relationships.each do |rel|
    edge = {
      source: person.id,
      target: rel.relative_id,
      relationship_type: rel.relationship_type
    }
    if rel.relationship_type == 'spouse'
      edge[:is_ex] = rel.is_ex
      edge[:is_deceased] = rel.is_deceased
    end
    relationships << edge
  end
end

puts "Total people: #{all_people.count}"
puts "Total relationships: #{relationships.count}"

# Test our buildRelationshipMaps function logic manually
parent_to_children = {}
child_to_parents = {}
sibling_map = {}

relationships.each do |rel|
  source = rel[:source].to_s
  target = rel[:target].to_s
  rel_type = rel[:relationship_type]
  
  case rel_type
  when 'parent'
    # Rails format: source HAS parent target (target is parent of source)
    parent_to_children[target] ||= []
    parent_to_children[target] << source unless parent_to_children[target].include?(source)
    
    child_to_parents[source] ||= []
    child_to_parents[source] << target unless child_to_parents[source].include?(target)
  when 'child'
    # Child relationship: source has a child named target
    parent_to_children[source] ||= []
    parent_to_children[source] << target unless parent_to_children[source].include?(target)
    
    child_to_parents[target] ||= []
    child_to_parents[target] << source unless child_to_parents[target].include?(source)
  when 'sibling'
    sibling_map[source] ||= []
    sibling_map[source] << target unless sibling_map[source].include?(target)
  end
end

puts "\n=== MANUAL RELATIONSHIP MAPS ==="
puts "Emily's parents: #{child_to_parents[emily.id.to_s]}"
puts "Michael's parents: #{child_to_parents[michael.id.to_s]}"

# Find shared parents
emily_parents = child_to_parents[emily.id.to_s] || []
michael_parents = child_to_parents[michael.id.to_s] || []
shared_parents = emily_parents & michael_parents

puts "Shared parents: #{shared_parents}"

# Check if Emily's parents include any of Michael's parents
puts "\n=== STEP-UNCLE DETECTION ==="
emily_parent_ids = child_to_parents[emily.id.to_s] || []
emily_parent_ids.each do |parent_id|
  parent = Person.find(parent_id.to_i)
  puts "Emily's parent: #{parent.first_name} #{parent.last_name} (#{parent_id})"
  
  # Get this parent's children (Emily's siblings and step-siblings)
  parent_children = parent_to_children[parent_id] || []
  puts "  Children of #{parent.first_name}: #{parent_children}"
  
  if parent_children.include?(michael.id.to_s)
    puts "  -> Michael is child of Emily's parent #{parent.first_name}"
    puts "  -> This means Michael should be Emily's STEP-UNCLE"
  end
end

puts "\n=== CHECKING WHY MICHAEL IS CONSIDERED UNCLE VS STEP-UNCLE ==="
# Based on the relationship calculator, let's trace the logic:
# Emily's parents: Alice (3) and David (4)
# Alice's parents: John (1) and Jane (2)  
# Michael's parents: John (1) and Lisa (12)
# So Michael is son of Emily's maternal grandmother's husband (John)
# John is Alice's father, Alice is Emily's mother
# So Michael is Emily's mother's step-brother (they share father John but different mothers)
# This makes Michael Emily's step-uncle

alice_id = emily_parents.find { |p| Person.find(p.to_i).first_name == 'Alice' }
if alice_id
  alice_parents = child_to_parents[alice_id] || []
  puts "Alice's parents: #{alice_parents.map { |p| Person.find(p.to_i).first_name }}"
  
  alice_parents.each do |grandparent_id|
    grandparent = Person.find(grandparent_id.to_i)
    grandparent_children = parent_to_children[grandparent_id] || []
    puts "#{grandparent.first_name}'s children: #{grandparent_children.map { |c| Person.find(c.to_i).first_name }}"
    
    if grandparent_children.include?(michael.id.to_s)
      puts "Michael is child of Emily's grandparent #{grandparent.first_name}"
      puts "Alice and Michael share parent #{grandparent.first_name} -> they are step-siblings"
      puts "Michael (Alice's step-brother) -> Emily's step-uncle"
    end
  end
end