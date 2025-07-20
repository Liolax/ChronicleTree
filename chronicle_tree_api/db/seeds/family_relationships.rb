# Family Relationships Seed Data
# This will create relationships between existing people to restore the family tree

puts "Creating family relationships..."

# Find the current user (assuming there's only one for testing)
user = User.first
unless user
  puts "No user found. Please create a user first."
  exit
end

# Get all people for this user
people = user.people.order(:id)
puts "Found #{people.count} people"

if people.count < 3
  puts "Need at least 3 people to create relationships"
  exit
end

# Create a simple family structure
# Let's assume Robert Doe (id: 9) is the root person
robert = people.find_by(first_name: 'Robert', last_name: 'Doe')
robert ||= people.find_by(id: 9)
robert ||= people.first

puts "Using #{robert.first_name} #{robert.last_name} as root person"

# Find or assign family members
other_people = people.where.not(id: robert.id).limit(10)

if other_people.count >= 2
  # Create parents for Robert
  parent1 = other_people[0]
  parent2 = other_people[1]
  
  puts "Creating parent relationships:"
  puts "  #{parent1.first_name} #{parent1.last_name} -> parent of #{robert.first_name}"
  puts "  #{parent2.first_name} #{parent2.last_name} -> parent of #{robert.first_name}"
  
  # Create parent-child relationships
  Relationship.find_or_create_by(
    person: parent1,
    relative: robert,
    relationship_type: 'child'
  )
  
  Relationship.find_or_create_by(
    person: parent2,
    relative: robert,
    relationship_type: 'child'
  )
  
  # Create spouse relationship between parents
  puts "  #{parent1.first_name} <-> #{parent2.first_name} (spouses)"
  Relationship.find_or_create_by(
    person: parent1,
    relative: parent2,
    relationship_type: 'spouse',
    is_ex: false
  )
  
  Relationship.find_or_create_by(
    person: parent2,
    relative: parent1,
    relationship_type: 'spouse',
    is_ex: false
  )
end

if other_people.count >= 4
  # Create children for Robert
  child1 = other_people[2]
  child2 = other_people[3]
  
  puts "Creating child relationships:"
  puts "  #{robert.first_name} -> parent of #{child1.first_name}"
  puts "  #{robert.first_name} -> parent of #{child2.first_name}"
  
  Relationship.find_or_create_by(
    person: robert,
    relative: child1,
    relationship_type: 'child'
  )
  
  Relationship.find_or_create_by(
    person: robert,
    relative: child2,
    relationship_type: 'child'
  )
end

if other_people.count >= 5
  # Create a spouse for Robert
  spouse = other_people[4]
  
  puts "Creating spouse relationship:"
  puts "  #{robert.first_name} <-> #{spouse.first_name} (spouses)"
  
  Relationship.find_or_create_by(
    person: robert,
    relative: spouse,
    relationship_type: 'spouse',
    is_ex: false
  )
  
  Relationship.find_or_create_by(
    person: spouse,
    relative: robert,
    relationship_type: 'spouse',
    is_ex: false
  )
end

if other_people.count >= 6
  # Create siblings for Robert
  sibling = other_people[5]
  
  # Siblings share parents
  if people.count >= 2
    parent1 = other_people[0]
    
    puts "Creating sibling relationship:"
    puts "  #{parent1.first_name} -> parent of #{sibling.first_name} (making #{sibling.first_name} sibling of #{robert.first_name})"
    
    Relationship.find_or_create_by(
      person: parent1,
      relative: sibling,
      relationship_type: 'child'
    )
  end
end

# Add more complex relationships if we have enough people
if other_people.count >= 8
  puts "Creating extended family relationships..."
  
  # Create grandparents
  grandparent1 = other_people[6]
  grandparent2 = other_people[7]
  parent1 = other_people[0]
  
  puts "  #{grandparent1.first_name} -> parent of #{parent1.first_name} (grandparent of #{robert.first_name})"
  
  Relationship.find_or_create_by(
    person: grandparent1,
    relative: parent1,
    relationship_type: 'child'
  )
  
  Relationship.find_or_create_by(
    person: grandparent2,
    relative: parent1,
    relationship_type: 'child'
  )
  
  # Grandparents are spouses
  Relationship.find_or_create_by(
    person: grandparent1,
    relative: grandparent2,
    relationship_type: 'spouse',
    is_ex: false
  )
  
  Relationship.find_or_create_by(
    person: grandparent2,
    relative: grandparent1,
    relationship_type: 'spouse',
    is_ex: false
  )
end

puts "Finished creating relationships!"
puts "Total relationships created: #{Relationship.count}"

# Show the family tree structure
puts "\nFamily tree structure:"
puts "Root person: #{robert.first_name} #{robert.last_name} (id: #{robert.id})"
puts "  Parents: #{robert.parents.map { |p| "#{p.first_name} #{p.last_name}" }.join(', ')}"
puts "  Spouses: #{robert.current_spouses.map { |s| "#{s.first_name} #{s.last_name}" }.join(', ')}"
puts "  Children: #{robert.children.map { |c| "#{c.first_name} #{c.last_name}" }.join(', ')}"
puts "  Siblings: #{robert.siblings.map { |s| "#{s.first_name} #{s.last_name}" }.join(', ')}"