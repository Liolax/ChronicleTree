# Investigation script for person ID 26 and the Molly/Robert marriage issue
require_relative 'config/environment'

puts "=== INVESTIGATING PERSON ID 26 AND MOLLY/ROBERT MARRIAGE ==="

# Find person ID 26 (the one causing the 500 error)
person_26 = Person.find_by(id: 26)
if person_26
  puts "\nPerson ID 26:"
  puts "- Name: #{person_26.first_name} #{person_26.last_name}"
  puts "- Gender: #{person_26.gender}"
  puts "- Birth: #{person_26.date_of_birth}"
  puts "- Death: #{person_26.date_of_death}"
  puts "- Is Deceased: #{person_26.is_deceased}"
else
  puts "\nPerson ID 26 not found in database!"
end

# Find all Mollys in the database
mollys = Person.where(first_name: 'Molly')
puts "\nAll Mollys in database:"
mollys.each do |molly|
  puts "- ID #{molly.id}: #{molly.first_name} #{molly.last_name} (deceased: #{molly.is_deceased})"
end

# Find all Roberts in the database
roberts = Person.where(first_name: 'Robert')
puts "\nAll Roberts in database:"
roberts.each do |robert|
  puts "- ID #{robert.id}: #{robert.first_name} #{robert.last_name} (deceased: #{robert.is_deceased})"
end

# If person 26 exists, check their relationships
if person_26
  puts "\n=== PERSON 26 RELATIONSHIPS ==="
  relationships = Relationship.where("person_id = :id OR relative_id = :id", id: 26)
  
  puts "Total relationships: #{relationships.count}"
  relationships.each do |rel|
    person = Person.find(rel.person_id)
    relative = Person.find(rel.relative_id)
    other_person = rel.person_id == 26 ? relative : person
    
    puts "- #{rel.relationship_type.capitalize}: #{other_person.first_name} #{other_person.last_name} (ID #{other_person.id})"
    puts "  is_ex: #{rel.is_ex}, is_deceased: #{rel.is_deceased}"
  end
  
  # Check if person 26 has spouse relationships
  spouse_relationships = relationships.where(relationship_type: 'spouse')
  if spouse_relationships.any?
    puts "\n=== SPOUSE RELATIONSHIPS FOR PERSON 26 ==="
    spouse_relationships.each do |rel|
      person = Person.find(rel.person_id)
      relative = Person.find(rel.relative_id)
      spouse = rel.person_id == 26 ? relative : person
      
      puts "- Spouse: #{spouse.first_name} #{spouse.last_name} (ID #{spouse.id})"
      puts "  Relationship status: is_ex=#{rel.is_ex}, is_deceased=#{rel.is_deceased}"
      puts "  Spouse status: alive=#{!spouse.is_deceased}, death=#{spouse.date_of_death}"
      
      # Check if this spouse has other current marriages
      other_marriages = Relationship.where(
        "(person_id = :spouse_id OR relative_id = :spouse_id) AND 
         relationship_type = 'spouse' AND 
         is_ex = false AND 
         is_deceased = false AND
         NOT ((person_id = :person_26 AND relative_id = :spouse_id) OR 
              (person_id = :spouse_id AND relative_id = :person_26))",
        spouse_id: spouse.id,
        person_26: 26
      )
      
      if other_marriages.any?
        puts "  ⚠️  CONFLICT: Spouse has other current marriages:"
        other_marriages.each do |other_rel|
          other_person = Person.find(other_rel.person_id == spouse.id ? other_rel.relative_id : other_rel.person_id)
          puts "    - Married to: #{other_person.first_name} #{other_person.last_name} (ID #{other_person.id})"
        end
      else
        puts "  ✓ No marriage conflicts detected"
      end
    end
  end
end

# Check the seeds to understand the mapping
puts "\n=== CHECKING SEEDS STRUCTURE ==="
puts "Looking for Molly and Robert in seeds..."

# Try to find the actual Molly-Robert pair
molly_robert_pairs = []
mollys.each do |molly|
  roberts.each do |robert|
    # Check if they have a spouse relationship
    relationship = Relationship.find_by(
      person: molly, 
      relative: robert, 
      relationship_type: 'spouse'
    ) || Relationship.find_by(
      person: robert, 
      relative: molly, 
      relationship_type: 'spouse'
    )
    
    if relationship
      molly_robert_pairs << {
        molly: molly,
        robert: robert,
        relationship: relationship
      }
    end
  end
end

puts "\nMolly-Robert married pairs found:"
molly_robert_pairs.each do |pair|
  puts "- Molly ID #{pair[:molly].id} married to Robert ID #{pair[:robert].id}"
  puts "  Molly: deceased=#{pair[:molly].is_deceased}, death=#{pair[:molly].date_of_death}"
  puts "  Robert: deceased=#{pair[:robert].is_deceased}, death=#{pair[:robert].date_of_death}"
  puts "  Relationship: is_ex=#{pair[:relationship].is_ex}, is_deceased=#{pair[:relationship].is_deceased}"
end

puts "\n=== INVESTIGATION COMPLETE ==="
