# Test what the actual API returns for Emily's family tree
puts '=== TESTING ACTUAL API RESPONSE FOR EMILY ==='
puts

# Find Emily
emily = Person.find_by(first_name: 'Emily')
if emily.nil?
  puts "ERROR: Emily not found!"
  exit
end

puts "Found Emily: #{emily.id} (#{emily.first_name} #{emily.last_name})"
puts

# Get the tree data using the correct method name
nodes, edges = People::TreeBuilder.new(emily).as_json

puts "=== NODES ==="
nodes.each do |node|
  puts "#{node.id}: #{node.first_name} #{node.last_name} (#{node.gender})"
end

puts
puts "=== RAW EDGES ==="
edges.each do |edge|
  source_name = nodes.find { |n| n.id == edge[:source] }&.first_name || "Unknown"
  target_name = nodes.find { |n| n.id == edge[:target] }&.first_name || "Unknown"
  
  status_info = ""
  if edge[:relationship_type] == 'spouse'
    status_info = " (ex: #{edge[:is_ex]}, deceased: #{edge[:is_deceased]})"
  end
  
  puts "#{source_name} → #{target_name}: #{edge[:relationship_type]}#{status_info}"
end

puts
puts "=== FIND MICHAEL IN EMILY'S TREE ==="

# Find Michael in the tree data
michael_node = nodes.find { |n| n.first_name == 'Michael' && n.last_name == 'Doe' }
if michael_node
  puts "SUCCESS: Michael found in Emily's tree: #{michael_node.id} (#{michael_node.first_name} #{michael_node.last_name})"
  
  # Find relationships involving Michael
  puts
  puts "=== MICHAEL'S RELATIONSHIPS IN EMILY'S TREE ==="
  michael_edges = edges.select { |e| e[:source] == michael_node.id || e[:target] == michael_node.id }
  
  michael_edges.each do |edge|
    if edge[:source] == michael_node.id
      other_name = nodes.find { |n| n.id == edge[:target] }&.first_name || "Unknown"
      puts "Michael → #{other_name}: #{edge[:relationship_type]}"
    else
      other_name = nodes.find { |n| n.id == edge[:source] }&.first_name || "Unknown"
      puts "#{other_name} → Michael: #{edge[:relationship_type]}"
    end
  end
else
  puts "ERROR: Michael NOT found in Emily's tree!"
  puts "This explains why the relationship isn't calculated correctly."
  puts "Emily's tree only includes: #{nodes.map(&:first_name).join(', ')}"
end