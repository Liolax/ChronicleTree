namespace :db do
  desc "Test deep generational blood relationships"
  task test_deep_relationships: :environment do
    puts "🧪 Testing deep generational blood relationship detection..."
    
    # Create test family for deep relationships if it doesn't exist
    user = User.first
    if user.nil?
      puts "❌ No user found. Please create a user first."
      exit
    end
    
    # Create a 4-generation family tree for testing
    great_grandparent = user.people.find_or_create_by(first_name: "Great", last_name: "Grandparent") do |p|
      p.date_of_birth = "1920-01-01"
      p.gender = "Male"
    end
    
    grandparent = user.people.find_or_create_by(first_name: "Grand", last_name: "Parent") do |p|
      p.date_of_birth = "1950-01-01"
      p.gender = "Female"
    end
    
    parent = user.people.find_or_create_by(first_name: "Test", last_name: "Parent") do |p|
      p.date_of_birth = "1980-01-01"
      p.gender = "Male"
    end
    
    child = user.people.find_or_create_by(first_name: "Test", last_name: "Child") do |p|
      p.date_of_birth = "2010-01-01"
      p.gender = "Female"
    end
    
    # Create relationships if they don't exist\n    # Great-grandparent -> Grandparent\n    unless Relationship.exists?(person: great_grandparent, relative: grandparent, relationship_type: 'child')\n      Relationship.create!(person: great_grandparent, relative: grandparent, relationship_type: 'child')\n      Relationship.create!(person: grandparent, relative: great_grandparent, relationship_type: 'parent')\n    end\n    \n    # Grandparent -> Parent\n    unless Relationship.exists?(person: grandparent, relative: parent, relationship_type: 'child')\n      Relationship.create!(person: grandparent, relative: parent, relationship_type: 'child')\n      Relationship.create!(person: parent, relative: grandparent, relationship_type: 'parent')\n    end\n    \n    # Parent -> Child\n    unless Relationship.exists?(person: parent, relative: child, relationship_type: 'child')\n      Relationship.create!(person: parent, relative: child, relationship_type: 'child')\n      Relationship.create!(person: child, relative: parent, relationship_type: 'parent')\n    end
    
    puts "\\n🏗️  Created 4-generation test family:"
    puts "   Great Grandparent (#{great_grandparent.id}) -> Grand Parent (#{grandparent.id}) -> Test Parent (#{parent.id}) -> Test Child (#{child.id})"
    
    # Test all generational relationships
    test_cases = [
      { person1: great_grandparent, person2: grandparent, expected: "child/parent" },
      { person1: great_grandparent, person2: parent, expected: "grandchild/grandparent" },
      { person1: great_grandparent, person2: child, expected: "great-grandchild/great-grandparent" },
      { person1: grandparent, person2: child, expected: "grandchild/grandparent" },
      { person1: parent, person2: child, expected: "child/parent" }
    ]
    
    puts "\\n🔍 Testing blood relationship detection:"
    test_cases.each do |test_case|
      detector = BloodRelationshipDetector.new(test_case[:person1], test_case[:person2])
      is_related = detector.blood_related?
      description = detector.relationship_description
      
      status = is_related ? "✅" : "❌"
      puts "   #{status} #{test_case[:person1].first_name} & #{test_case[:person2].first_name}: #{is_related ? description : 'Not detected as blood relatives'}"
      puts "      Expected: #{test_case[:expected]}"
    end
    
    puts "\\n🚫 Testing marriage blocking:"
    test_cases.each do |test_case|
      # Try to create a spouse relationship (should fail)
      relationship = Relationship.new(
        person: test_case[:person1],
        relative: test_case[:person2],
        relationship_type: 'spouse'
      )
      
      if relationship.valid?
        puts "   ❌ FAILED: #{test_case[:person1].first_name} & #{test_case[:person2].first_name} marriage was allowed!"
      else
        puts "   ✅ BLOCKED: #{test_case[:person1].first_name} & #{test_case[:person2].first_name} marriage correctly blocked"
        puts "      Reason: #{relationship.errors.full_messages.first}"
      end
    end
  end
end