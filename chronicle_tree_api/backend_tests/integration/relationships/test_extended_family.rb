# Test script to create extended family data and test 4-5 generations
puts "Creating extended family data to test 4-5 generations..."

person = Person.first
if person.nil?
  puts "No people found in database."
  exit 1
end

puts "Testing with person: #{person.full_name} (ID: #{person.id})"

# First, let's see what family data currently exists
puts "\nCurrent family structure:"
puts "- Parents: #{person.parents.map(&:full_name).join(', ')}" if person.parents.any?
puts "- Spouse: #{person.current_spouses.map(&:full_name).join(', ')}" if person.current_spouses.any?
puts "- Children: #{person.children.map(&:full_name).join(', ')}" if person.children.any?

# Add grandparents (parents of parents)
begin
  person.parents.each do |parent|
    # Check if this parent already has parents
    if parent.parents.empty?
      puts "\nAdding grandparents for #{parent.full_name}..."
      
      # Create maternal grandparents
      grandmother = person.user.people.find_or_create_by(
        first_name: "#{parent.first_name.first}GM",
        last_name: "GrandMother",
        date_of_birth: Date.new(1920, rand(1..12), rand(1..28)),
        gender: "female"
      )
      
      grandfather = person.user.people.find_or_create_by(
        first_name: "#{parent.first_name.first}GF", 
        last_name: "GrandFather",
        date_of_birth: Date.new(1920, rand(1..12), rand(1..28)),
        gender: "male"
      )
      
      # Create parent relationships
      parent.relationships.find_or_create_by(
        relative_id: grandmother.id,
        relationship_type: 'parent'
      )
      
      parent.relationships.find_or_create_by(
        relative_id: grandfather.id,
        relationship_type: 'parent'
      )
      
      puts "  Added: #{grandmother.full_name} and #{grandfather.full_name}"
    end
  end
  
  # Add grandchildren (children of children)
  person.children.each do |child|
    # Check if this child already has children AND is old enough to have children (at least 15 years old)
    child_age = Date.current.year - child.date_of_birth.year
    if child.children.empty? && child_age >= 15
      puts "\nAdding grandchildren via #{child.full_name} (age #{child_age})..."
      
      # Create grandchildren
      grandchild1 = person.user.people.find_or_create_by(
        first_name: "#{child.first_name}Jr",
        last_name: "GrandChild",
        date_of_birth: Date.new(2010, rand(1..12), rand(1..28))
      )
      
      grandchild2 = person.user.people.find_or_create_by(
        first_name: "#{child.first_name}ette",
        last_name: "GrandChild", 
        date_of_birth: Date.new(2012, rand(1..12), rand(1..28))
      )
      
      # Create child relationships
      child.relationships.find_or_create_by(
        relative_id: grandchild1.id,
        relationship_type: 'child'
      )
      
      child.relationships.find_or_create_by(
        relative_id: grandchild2.id,
        relationship_type: 'child'
      )
      
      puts "  Added: #{grandchild1.full_name} and #{grandchild2.full_name}"
    end
  end
  
  puts "\nSUCCESS: Extended family data created!"
  
rescue => e
  puts "Error creating family data: #{e.message}"
end

# Now test the 4 and 5 generation logic with extended family
puts "\n" + "="*50
puts "Testing 4-5 generations with extended family data:"

[3, 4, 5].each do |gen_count|
  puts "\n#{gen_count}. Testing #{gen_count} generation(s)..."
  
  begin
    generator = ImageGeneration::TreeSnippetGenerator.new
    generator.instance_variable_set(:@root_person, person)
    generator.instance_variable_set(:@generations, gen_count)
    generator.instance_variable_set(:@include_step_relationships, true)
    
    # Test the tree building logic directly
    tree_data = generator.send(:build_tree_structure)
    
    puts "  Tree structure analysis:"
    total_people = 0
    tree_data.keys.sort.each do |generation_offset|
      people = tree_data[generation_offset]
      if people.any?
        puts "    Generation #{generation_offset}: #{people.length} people"
        people.each { |p| puts "      - #{p.full_name}" }
        total_people += people.length
      end
    end
    
    puts "  Total people: #{total_people}, Generations: #{tree_data.keys.length}"
    
    # Test actual image generation
    image_path = generator.generate(person, generations: gen_count, include_step_relationships: true)
    puts "  SUCCESS: Image generated: #{image_path}"
    
  rescue => e
    puts "  FAIL: Generation failed: #{e.message}"
  end
end

puts "\nSUCCESS: Extended family testing completed!"