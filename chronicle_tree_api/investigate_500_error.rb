# Investigation script for the 500 error when making Molly alive
# This script will examine all relationships to understand the marriage logic

require_relative 'config/environment'

puts "=== INVESTIGATING 500 ERROR FOR MOLLY ==="

# Find all people mentioned in the issue
molly = Person.find_by(first_name: 'Molly', last_name: 'Doe')
robert = Person.find_by(first_name: 'Robert', last_name: 'Doe')
lisa = Person.find_by(first_name: 'Lisa')
jane = Person.find_by(first_name: 'Jane')

puts "\nFinding people mentioned in the issue:"
puts "- Molly: #{molly ? "ID #{molly.id}, deceased: #{molly.is_deceased}" : 'Not found'}"
puts "- Robert: #{robert ? "ID #{robert.id}, deceased: #{robert.is_deceased}" : 'Not found'}"
puts "- Lisa: #{lisa ? "ID #{lisa.id}, deceased: #{lisa.is_deceased}" : 'Not found'}"
puts "- Jane: #{jane ? "ID #{jane.id}, deceased: #{jane.is_deceased}" : 'Not found'}"

if molly && robert
  puts "\n=== ROBERT'S MARRIAGE RELATIONSHIPS ==="
  robert_spouse_relationships = Relationship.where(
    "(person_id = :id OR relative_id = :id) AND relationship_type = 'spouse'",
    id: robert.id
  )
  
  puts "Total spouse relationships for Robert: #{robert_spouse_relationships.count}"
  robert_spouse_relationships.each do |rel|
    person = Person.find(rel.person_id)
    relative = Person.find(rel.relative_id)
    other_person = rel.person_id == robert.id ? relative : person
    
    puts "- #{person.full_name} <-> #{relative.full_name}"
    puts "  is_ex: #{rel.is_ex}, is_deceased: #{rel.is_deceased}"
    puts "  #{other_person.full_name}: alive=#{!other_person.is_deceased}, death=#{other_person.date_of_death}"
  end
  
  puts "\n=== CHECKING CURRENT SPOUSES ==="
  current_spouses = robert.current_spouses
  puts "Robert's current spouses: #{current_spouses.map(&:full_name)}"
  
  all_spouses = robert.all_spouses_including_deceased
  puts "Robert's all spouses (including deceased): #{all_spouses.map(&:full_name)}"
  
  puts "\n=== MOLLY'S MARRIAGE RELATIONSHIPS ==="
  molly_spouse_relationships = Relationship.where(
    "(person_id = :id OR relative_id = :id) AND relationship_type = 'spouse'",
    id: molly.id
  )
  
  molly_spouse_relationships.each do |rel|
    person = Person.find(rel.person_id)
    relative = Person.find(rel.relative_id)
    puts "- #{person.full_name} <-> #{relative.full_name}"
    puts "  is_ex: #{rel.is_ex}, is_deceased: #{rel.is_deceased}"
  end
  
  puts "\n=== TESTING MARRIAGE CONFLICT LOGIC ==="
  # Simulate making Molly alive
  puts "If we make Molly alive, checking for conflicts..."
  
  # Check Robert's relationships excluding Molly
  other_current_marriages = Relationship.where(
    "(person_id = :robert_id OR relative_id = :robert_id) AND 
     relationship_type = 'spouse' AND 
     is_ex = false AND 
     is_deceased = false AND
     NOT ((person_id = :molly_id AND relative_id = :robert_id) OR 
          (person_id = :robert_id AND relative_id = :molly_id))",
    robert_id: robert.id,
    molly_id: molly.id
  )
  
  puts "Robert's other current marriages (excluding Molly): #{other_current_marriages.count}"
  other_current_marriages.each do |rel|
    person = Person.find(rel.person_id)
    relative = Person.find(rel.relative_id)
    other_person = rel.person_id == robert.id ? relative : person
    puts "- Conflict with: #{other_person.full_name} (alive: #{!other_person.is_deceased})"
  end
  
  if other_current_marriages.count > 0
    puts "\n⚠️  MARRIAGE CONFLICT DETECTED!"
    puts "Robert has other current marriages, so Molly cannot be made alive."
  else
    puts "\n✓ No marriage conflicts detected. Molly can be made alive."
  end
  
end

puts "\n=== CHECKING ROBERT'S CHILDREN'S SPOUSES ==="
if robert
  children = robert.children
  children.each do |child|
    puts "\n#{child.full_name} (#{child.gender}):"
    child_spouses = child.current_spouses
    puts "  Current spouses: #{child_spouses.map(&:full_name)}"
    
    # Check if any of the children are Lisa or have Lisa as spouse
    child_spouses.each do |spouse|
      if spouse.first_name == 'Lisa'
        puts "  ⚠️  Found Lisa as #{child.full_name}'s spouse!"
        
        # Check Lisa's marriage status
        lisa_marriages = Relationship.where(
          "(person_id = :id OR relative_id = :id) AND relationship_type = 'spouse'",
          id: spouse.id
        )
        
        puts "  Lisa's marriage relationships:"
        lisa_marriages.each do |rel|
          person = Person.find(rel.person_id)
          relative = Person.find(rel.relative_id)
          other_person = rel.person_id == spouse.id ? relative : person
          puts "    - To #{other_person.full_name}: is_ex=#{rel.is_ex}, is_deceased=#{rel.is_deceased}"
        end
      end
    end
  end
end

puts "\n=== INVESTIGATION COMPLETE ==="
