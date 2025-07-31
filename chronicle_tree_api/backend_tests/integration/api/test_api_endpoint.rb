# Test the actual API endpoint that the frontend calls
require 'net/http'
require 'json'

puts '=== TESTING ACTUAL API ENDPOINT FOR EMILY ==='
puts

# Find Emily's ID
emily = Person.find_by(first_name: 'Emily')
if emily.nil?
  puts "ERROR: Emily not found!"
  exit
end

puts "Found Emily: #{emily.id} (#{emily.first_name} #{emily.last_name})"
puts

# Simulate the API call
puts "Testing API endpoint: GET /api/v1/people/#{emily.id}/tree"

# We'll simulate what the controller does
controller_logic = -> do
  person = Person.find(emily.id)
  nodes, edges = People::TreeBuilder.new(person).as_json
  
  # Serialize nodes like the controller does
  serialized_nodes = nodes.map do |node|
    {
      id: node.id,
      first_name: node.first_name,
      last_name: node.last_name,
      full_name: "#{node.first_name} #{node.last_name}",
      gender: node.gender,
      date_of_birth: node.date_of_birth,
      date_of_death: node.date_of_death,
      is_deceased: node.is_deceased
    }
  end
  
  {
    nodes: serialized_nodes,
    edges: edges
  }
end

api_response = controller_logic.call

puts "=== API RESPONSE ANALYSIS ==="
puts

michael_node = api_response[:nodes].find { |n| n[:first_name] == 'Michael' && n[:last_name] == 'Doe' }
if michael_node
  puts "SUCCESS: Michael found in API response: #{michael_node[:id]} (#{michael_node[:first_name]} #{michael_node[:last_name]})"
  
  # Check what relationships Michael has in the API response
  michael_edges = api_response[:edges].select { |e| e[:source] == michael_node[:id] || e[:target] == michael_node[:id] }
  
  puts
  puts "Michael's relationships in API response:"
  michael_edges.each do |edge|
    if edge[:source] == michael_node[:id]
      other_node = api_response[:nodes].find { |n| n[:id] == edge[:target] }
      puts "  Michael → #{other_node[:first_name]}: #{edge[:relationship_type]}"
    else
      other_node = api_response[:nodes].find { |n| n[:id] == edge[:source] }
      puts "  #{other_node[:first_name]} → Michael: #{edge[:relationship_type]}"
    end
  end
  
  # Check if there are any sibling relationships between Michael and Alice/Charlie
  alice_michael_sibling = michael_edges.find do |e|
    other_id = e[:source] == michael_node[:id] ? e[:target] : e[:source]
    other_node = api_response[:nodes].find { |n| n[:id] == other_id }
    other_node && other_node[:first_name] == 'Alice' && e[:relationship_type] == 'sibling'
  end
  
  if alice_michael_sibling
    puts
    puts "ERROR: PROBLEM: Found explicit sibling relationship between Michael and Alice in API!"
    puts "This will cause Emily to see Michael as Uncle instead of Step-Uncle."
  else
    puts
    puts "SUCCESS: GOOD: No explicit sibling relationship between Michael and Alice in API."
    puts "The step-relationship should be calculated correctly."
  end
  
else
  puts "ERROR: Michael NOT found in API response!"
end

puts
puts "=== CACHE CHECK ==="
puts "If the frontend still shows Michael as Uncle:"
puts "1. Clear browser cache and reload"
puts "2. Check if there's any frontend caching (localStorage, sessionStorage)"
puts "3. Try a hard refresh (Ctrl+F5)"
puts "4. Check browser developer tools Network tab to see actual API response"