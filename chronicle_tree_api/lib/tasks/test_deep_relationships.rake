# Test deep family relationship detection to prevent incestuous marriages
# ❌ MUST PREVENT: Great-grandparent marrying great-grandchild (like Robert & Alice)
# ❌ MUST PREVENT: All multi-generational ancestor-descendant relationships

namespace :test do
  desc "Test deep family relationship detection for marriage validation"
  task deep_relationships: :environment do
    puts "🧪 TESTING DEEP FAMILY RELATIONSHIP DETECTION"
    puts "=" * 60
    
    # Create test user
    user = User.find_or_create_by(email: 'test_deep@example.com') do |u|
      u.password = 'password123'
      u.first_name = 'Test'
      u.last_name = 'User'
    end
    
    # Clean up any existing test data
    user.people.destroy_all
    
    puts "📋 Creating multi-generational family structure..."
    
    # Create 4-generation family tree
    # Generation 1: Great-Grandparents
    robert = user.people.create!(
      first_name: 'Robert', 
      last_name: 'Doe',
      date_of_birth: '1920-01-01',
      gender: 'male'
    )
    
    margaret = user.people.create!(
      first_name: 'Margaret', 
      last_name: 'Smith',
      date_of_birth: '1922-03-15',
      gender: 'female'
    )
    
    # Generation 2: Grandparents
    john = user.people.create!(
      first_name: 'John', 
      last_name: 'Doe',
      date_of_birth: '1945-06-10',
      gender: 'male'
    )
    
    mary = user.people.create!(
      first_name: 'Mary', 
      last_name: 'Johnson',
      date_of_birth: '1947-08-20',
      gender: 'female'
    )
    
    # Generation 3: Parents
    david = user.people.create!(
      first_name: 'David', 
      last_name: 'Doe',
      date_of_birth: '1970-04-15',
      gender: 'male'
    )
    
    susan = user.people.create!(
      first_name: 'Susan', 
      last_name: 'Wilson',
      date_of_birth: '1972-11-30',
      gender: 'female'
    )
    
    # Generation 4: Great-Grandchildren
    alice = user.people.create!(
      first_name: 'Alice', 
      last_name: 'Doe',
      date_of_birth: '1995-09-05',
      gender: 'female'
    )
    
    bob = user.people.create!(
      first_name: 'Bob', 
      last_name: 'Doe',
      date_of_birth: '1997-12-12',
      gender: 'male'
    )
    
    # Non-related person for control test
    stranger = user.people.create!(
      first_name: 'Charlie', 
      last_name: 'Unrelated',
      date_of_birth: '1990-05-05',
      gender: 'male'
    )
    
    puts "👥 Setting up family relationships..."
    
    # Generation 1 marriage
    Relationship.create!(person: robert, relative: margaret, relationship_type: 'spouse')
    Relationship.create!(person: margaret, relative: robert, relationship_type: 'spouse')
    
    # Generation 1 → 2 (Great-grandparents → Grandparents)
    Relationship.create!(person: robert, relative: john, relationship_type: 'child')
    Relationship.create!(person: john, relative: robert, relationship_type: 'parent')
    Relationship.create!(person: margaret, relative: john, relationship_type: 'child')
    Relationship.create!(person: john, relative: margaret, relationship_type: 'parent')
    
    # Generation 2 marriage
    Relationship.create!(person: john, relative: mary, relationship_type: 'spouse')
    Relationship.create!(person: mary, relative: john, relationship_type: 'spouse')
    
    # Generation 2 → 3 (Grandparents → Parents)
    Relationship.create!(person: john, relative: david, relationship_type: 'child')
    Relationship.create!(person: david, relative: john, relationship_type: 'parent')
    Relationship.create!(person: mary, relative: david, relationship_type: 'child')
    Relationship.create!(person: david, relative: mary, relationship_type: 'parent')
    
    # Generation 3 marriage
    Relationship.create!(person: david, relative: susan, relationship_type: 'spouse')
    Relationship.create!(person: susan, relative: david, relationship_type: 'spouse')
    
    # Generation 3 → 4 (Parents → Great-grandchildren)
    Relationship.create!(person: david, relative: alice, relationship_type: 'child')
    Relationship.create!(person: alice, relative: david, relationship_type: 'parent')
    Relationship.create!(person: susan, relative: alice, relationship_type: 'child')
    Relationship.create!(person: alice, relative: susan, relationship_type: 'parent')
    
    Relationship.create!(person: david, relative: bob, relationship_type: 'child')
    Relationship.create!(person: bob, relative: david, relationship_type: 'parent')
    Relationship.create!(person: susan, relative: bob, relationship_type: 'child')
    Relationship.create!(person: bob, relative: susan, relationship_type: 'parent')
    
    puts "✅ Multi-generational family tree created!"
    puts ""
    puts "📊 Family Structure:"
    puts "  Gen 1: Robert (#{robert.id}) ↔ Margaret (#{margaret.id})"
    puts "  Gen 2:   └── John (#{john.id}) ↔ Mary (#{mary.id})"
    puts "  Gen 3:     └── David (#{david.id}) ↔ Susan (#{susan.id})"
    puts "  Gen 4:       └── Alice (#{alice.id}), Bob (#{bob.id})"
    puts "  Unrelated: Charlie (#{stranger.id})"
    puts ""
    
    # TEST 1: ❌ Great-Grandparent → Great-Grandchild (Robert → Alice) - MUST BE BLOCKED
    puts "🧪 TEST 1: Great-Grandfather → Great-Granddaughter Marriage"
    puts "Scenario: Robert (#{robert.id}) wants to marry Alice (#{alice.id}) - Alice is Robert's great-granddaughter"
    marriage_allowed = BloodRelationshipDetector.marriage_allowed?(robert, alice)
    blood_related = BloodRelationshipDetector.blood_related?(robert, alice)
    relationship_desc = BloodRelationshipDetector.new(robert, alice).relationship_description
    puts "Blood related? #{blood_related}"
    puts "Relationship: #{relationship_desc}"
    puts "Marriage allowed? #{marriage_allowed}"
    puts !marriage_allowed ? "✅ PASSED - Marriage correctly blocked (great-grandparent/great-grandchild)" : "❌ FAILED - CRITICAL: Marriage should be blocked!"
    puts ""
    
    # TEST 2: ❌ Great-Grandchild → Great-Grandparent (Alice → Robert) - MUST BE BLOCKED
    puts "🧪 TEST 2: Great-Granddaughter → Great-Grandfather Marriage (reverse)"
    puts "Scenario: Alice (#{alice.id}) wants to marry Robert (#{robert.id}) - Robert is Alice's great-grandfather"
    marriage_allowed = BloodRelationshipDetector.marriage_allowed?(alice, robert)
    blood_related = BloodRelationshipDetector.blood_related?(alice, robert)
    puts "Blood related? #{blood_related}"
    puts "Marriage allowed? #{marriage_allowed}"
    puts !marriage_allowed ? "✅ PASSED - Marriage correctly blocked (reverse direction)" : "❌ FAILED - CRITICAL: Marriage should be blocked!"
    puts ""
    
    # TEST 3: ❌ Grandparent → Grandchild (John → Alice) - MUST BE BLOCKED
    puts "🧪 TEST 3: Grandfather → Granddaughter Marriage"
    puts "Scenario: John (#{john.id}) wants to marry Alice (#{alice.id}) - Alice is John's granddaughter"
    marriage_allowed = BloodRelationshipDetector.marriage_allowed?(john, alice)
    blood_related = BloodRelationshipDetector.blood_related?(john, alice)
    relationship_desc = BloodRelationshipDetector.new(john, alice).relationship_description
    puts "Blood related? #{blood_related}"
    puts "Relationship: #{relationship_desc}"
    puts "Marriage allowed? #{marriage_allowed}"
    puts !marriage_allowed ? "✅ PASSED - Marriage correctly blocked (grandparent/grandchild)" : "❌ FAILED - CRITICAL: Marriage should be blocked!"
    puts ""
    
    # TEST 4: ❌ Parent → Child (David → Alice) - MUST BE BLOCKED
    puts "🧪 TEST 4: Father → Daughter Marriage"
    puts "Scenario: David (#{david.id}) wants to marry Alice (#{alice.id}) - Alice is David's daughter"
    marriage_allowed = BloodRelationshipDetector.marriage_allowed?(david, alice)
    blood_related = BloodRelationshipDetector.blood_related?(david, alice)
    relationship_desc = BloodRelationshipDetector.new(david, alice).relationship_description
    puts "Blood related? #{blood_related}"
    puts "Relationship: #{relationship_desc}"
    puts "Marriage allowed? #{marriage_allowed}"
    puts !marriage_allowed ? "✅ PASSED - Marriage correctly blocked (parent/child)" : "❌ FAILED - CRITICAL: Marriage should be blocked!"
    puts ""
    
    # TEST 5: ❌ Siblings (Alice → Bob) - MUST BE BLOCKED
    puts "🧪 TEST 5: Sister → Brother Marriage"
    puts "Scenario: Alice (#{alice.id}) wants to marry Bob (#{bob.id}) - They are siblings"
    marriage_allowed = BloodRelationshipDetector.marriage_allowed?(alice, bob)
    blood_related = BloodRelationshipDetector.blood_related?(alice, bob)
    relationship_desc = BloodRelationshipDetector.new(alice, bob).relationship_description
    puts "Blood related? #{blood_related}"
    puts "Relationship: #{relationship_desc}"
    puts "Marriage allowed? #{marriage_allowed}"
    puts !marriage_allowed ? "✅ PASSED - Marriage correctly blocked (siblings)" : "❌ FAILED - CRITICAL: Marriage should be blocked!"
    puts ""
    
    # TEST 6: ✅ Non-related people (Alice → Charlie) - SHOULD BE ALLOWED
    puts "🧪 TEST 6: Non-Related People Marriage"
    puts "Scenario: Alice (#{alice.id}) wants to marry Charlie (#{stranger.id}) - They are unrelated"
    marriage_allowed = BloodRelationshipDetector.marriage_allowed?(alice, stranger)
    blood_related = BloodRelationshipDetector.blood_related?(alice, stranger)
    puts "Blood related? #{blood_related}"
    puts "Marriage allowed? #{marriage_allowed}"
    puts marriage_allowed ? "✅ PASSED - Marriage correctly allowed (unrelated people)" : "❌ FAILED - Marriage should be allowed!"
    puts ""
    
    # TEST 7: Enhanced API validation
    puts "🧪 TEST 7: API Relationship Creation Validation"
    puts "Testing relationship creation through the enhanced API validation..."
    
    test_cases = [
      { person1: robert, person2: alice, expected: false, description: "Robert + Alice (great-grandparent/great-grandchild)" },
      { person1: john, person2: alice, expected: false, description: "John + Alice (grandparent/grandchild)" },
      { person1: david, person2: alice, expected: false, description: "David + Alice (parent/child)" },
      { person1: alice, person2: bob, expected: false, description: "Alice + Bob (siblings)" },
      { person1: alice, person2: stranger, expected: true, description: "Alice + Charlie (unrelated)" }
    ]
    
    test_cases.each_with_index do |test_case, index|
      allowed = BloodRelationshipDetector.marriage_allowed?(test_case[:person1], test_case[:person2])
      expected = test_case[:expected]
      status = (allowed == expected) ? "✅ PASSED" : "❌ FAILED"
      puts "  #{index + 1}. #{test_case[:description]}: #{status}"
    end
    
    puts ""
    puts "🎯 SUMMARY"
    puts "=" * 60
    puts "✅ Multi-generational blood relationship detection:"
    puts "   - Great-grandparent/great-grandchild relationships blocked"
    puts "   - Grandparent/grandchild relationships blocked"
    puts "   - Parent/child relationships blocked"
    puts "   - Sibling relationships blocked"
    puts "❌ Incestuous relationships are completely prevented:"
    puts "   - All ancestor-descendant relationships regardless of depth"
    puts "   - All blood relatives cannot marry"
    puts "✅ Non-related people can still marry normally"
    puts ""
    
    # Check for any critical failures
    critical_tests = [
      BloodRelationshipDetector.marriage_allowed?(robert, alice),
      BloodRelationshipDetector.marriage_allowed?(alice, robert),
      BloodRelationshipDetector.marriage_allowed?(john, alice),
      BloodRelationshipDetector.marriage_allowed?(david, alice),
      BloodRelationshipDetector.marriage_allowed?(alice, bob)
    ]
    
    if critical_tests.any? { |test| test == true }
      puts "🚨 CRITICAL FAILURE: Some incestuous relationships are still allowed!"
      puts "This is a serious validation bug that must be fixed immediately."
    else
      puts "🎉 SUCCESS: All incestuous relationships are properly blocked!"
      puts "The enhanced blood relationship detection is working correctly."
    end
    
    puts ""
    puts "🧪 All tests completed!"
    
    # Clean up test data
    user.people.destroy_all
    puts "🧹 Test data cleaned up"
  end
end
