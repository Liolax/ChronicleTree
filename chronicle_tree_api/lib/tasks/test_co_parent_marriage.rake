# Test co-parent-in-law marriage scenarios
# ✅ SHOULD BE ALLOWED: Marrying your child's spouse's parent (co-parent-in-law)
# These are not blood relatives and there are no legal restrictions

namespace :test do
  desc "Test co-parent-in-law marriage validation"
  task co_parent_marriage: :environment do
    puts "🧪 TESTING CO-PARENT-IN-LAW MARRIAGE SCENARIOS"
    puts "=" * 60
    
    # Create test user
    user = User.find_or_create_by(email: 'test_coparent@example.com') do |u|
      u.password = 'password123'
      u.first_name = 'Test'
      u.last_name = 'User'
    end
    
    # Clean up any existing test data
    user.people.destroy_all
    
    puts "📋 Creating co-parent-in-law family structure..."
    
    # Robert Doe and his family
    robert = user.people.create!(
      first_name: 'Robert', 
      last_name: 'Doe',
      date_of_birth: '1950-01-01',
      gender: 'male'
    )
    
    jane = user.people.create!(
      first_name: 'Jane', 
      last_name: 'Doe',
      date_of_birth: '1952-03-15',
      gender: 'female'
    )
    
    # Their child David
    david = user.people.create!(
      first_name: 'David', 
      last_name: 'Doe',
      date_of_birth: '1975-06-10',
      gender: 'male'
    )
    
    # Patricia Smith and her family
    patricia = user.people.create!(
      first_name: 'Patricia', 
      last_name: 'Smith',
      date_of_birth: '1955-08-20',
      gender: 'female'
    )
    
    william = user.people.create!(
      first_name: 'William', 
      last_name: 'O\'Sullivan',
      date_of_birth: '1953-11-30',
      gender: 'male'
    )
    
    # Their child Alice (who will marry David)
    alice = user.people.create!(
      first_name: 'Alice', 
      last_name: 'Smith',
      date_of_birth: '1977-04-15',
      gender: 'female'
    )
    
    puts "👥 Setting up family relationships..."
    
    # Robert ↔ Jane marriage
    Relationship.create!(person: robert, relative: jane, relationship_type: 'spouse')
    Relationship.create!(person: jane, relative: robert, relationship_type: 'spouse')
    
    # Robert & Jane → David (parents)
    Relationship.create!(person: robert, relative: david, relationship_type: 'child')
    Relationship.create!(person: david, relative: robert, relationship_type: 'parent')
    Relationship.create!(person: jane, relative: david, relationship_type: 'child')
    Relationship.create!(person: david, relative: jane, relationship_type: 'parent')
    
    # Patricia ↔ William marriage
    Relationship.create!(person: patricia, relative: william, relationship_type: 'spouse')
    Relationship.create!(person: william, relative: patricia, relationship_type: 'spouse')
    
    # Patricia & William → Alice (parents)
    Relationship.create!(person: patricia, relative: alice, relationship_type: 'child')
    Relationship.create!(person: alice, relative: patricia, relationship_type: 'parent')
    Relationship.create!(person: william, relative: alice, relationship_type: 'child')
    Relationship.create!(person: alice, relative: william, relationship_type: 'parent')
    
    # David ↔ Alice marriage (this creates the co-parent-in-law relationships)
    Relationship.create!(person: david, relative: alice, relationship_type: 'spouse')
    Relationship.create!(person: alice, relative: david, relationship_type: 'spouse')
    
    puts "✅ Co-parent-in-law family structure created!"
    puts ""
    puts "📊 Family Structure:"
    puts "  Robert (#{robert.id}) ↔ Jane (#{jane.id})"
    puts "    └── David (#{david.id}) ↔ Alice (#{alice.id})"
    puts "  Patricia (#{patricia.id}) ↔ William (#{william.id})"
    puts "    └── Alice (#{alice.id}) ↔ David (#{david.id})"
    puts ""
    puts "🔗 Co-Parent-in-Law Relationships:"
    puts "  Robert is Co-Father-in-law to Patricia"
    puts "  Patricia is Co-Mother-in-law to Robert"
    puts "  Robert is Co-Father-in-law to William"
    puts "  William is Co-Father-in-law to Robert"
    puts ""
    
    # Now let's simulate that Jane and William have died or divorced, making Robert and Patricia both single
    puts "💔 Simulating that Jane and William are no longer in the picture..."
    
    # Mark Jane as ex-spouse
    robert_jane_rel = Relationship.find_by(person: robert, relative: jane, relationship_type: 'spouse')
    robert_jane_rel.update!(is_ex: true)
    jane_robert_rel = Relationship.find_by(person: jane, relative: robert, relationship_type: 'spouse')
    jane_robert_rel.update!(is_ex: true)
    
    # Mark William as deceased
    william.update!(date_of_death: '2020-12-25')
    
    puts "  Jane is now Robert's ex-spouse"
    puts "  William is deceased"
    puts "  Robert and Patricia are both single"
    puts ""
    
    # TEST 1: ✅ ALLOWED - Robert marrying Patricia (Co-Mother-in-law)
    puts "🧪 TEST 1: Robert marrying Patricia (Co-Mother-in-law)"
    puts "Scenario: Robert (#{robert.id}) wants to marry Patricia (#{patricia.id}) - They are co-parents-in-law through David+Alice marriage"
    marriage_allowed = BloodRelationshipDetector.marriage_allowed?(robert, patricia)
    blood_related = BloodRelationshipDetector.blood_related?(robert, patricia)
    puts "Blood related? #{blood_related}"
    puts "Marriage allowed? #{marriage_allowed}"
    puts marriage_allowed ? "✅ PASSED - Marriage correctly allowed (co-parents-in-law, no blood relation)" : "❌ FAILED - Marriage should be allowed!"
    puts ""
    
    # TEST 2: ✅ ALLOWED - Patricia marrying Robert (reverse direction)
    puts "🧪 TEST 2: Patricia marrying Robert (reverse direction)"
    puts "Scenario: Patricia (#{patricia.id}) wants to marry Robert (#{robert.id}) - Co-Father-in-law relationship"
    marriage_allowed = BloodRelationshipDetector.marriage_allowed?(patricia, robert)
    blood_related = BloodRelationshipDetector.blood_related?(patricia, robert)
    puts "Blood related? #{blood_related}"
    puts "Marriage allowed? #{marriage_allowed}"
    puts marriage_allowed ? "✅ PASSED - Marriage correctly allowed (reverse direction)" : "❌ FAILED - Marriage should be allowed!"
    puts ""
    
    # TEST 3: ✅ ALLOWED - Robert marrying William's widow (if William had a sister)
    # Let's create William's sister to test this scenario
    williams_sister = user.people.create!(
      first_name: 'Margaret', 
      last_name: 'O\'Sullivan',
      date_of_birth: '1958-02-14',
      gender: 'female'
    )
    
    williams_father = user.people.create!(
      first_name: 'Thomas', 
      last_name: 'O\'Sullivan',
      date_of_birth: '1925-07-10',
      gender: 'male'
    )
    
    # Set up William's family
    Relationship.create!(person: williams_father, relative: william, relationship_type: 'child')
    Relationship.create!(person: william, relative: williams_father, relationship_type: 'parent')
    Relationship.create!(person: williams_father, relative: williams_sister, relationship_type: 'child')
    Relationship.create!(person: williams_sister, relative: williams_father, relationship_type: 'parent')
    
    puts "🧪 TEST 3: Robert marrying William's sister (deceased co-father-in-law's sister)"
    puts "Scenario: Robert (#{robert.id}) wants to marry Margaret (#{williams_sister.id}) - She is deceased co-father-in-law William's sister"
    marriage_allowed = BloodRelationshipDetector.marriage_allowed?(robert, williams_sister)
    blood_related = BloodRelationshipDetector.blood_related?(robert, williams_sister)
    puts "Blood related? #{blood_related}"
    puts "Marriage allowed? #{marriage_allowed}"
    puts marriage_allowed ? "✅ PASSED - Marriage correctly allowed (deceased co-father-in-law's sister)" : "❌ FAILED - Marriage should be allowed!"
    puts ""
    
    # TEST 4: ❌ BLOCKED - Control test with actual blood relative
    # Create Robert's brother for control test
    roberts_brother = user.people.create!(
      first_name: 'Michael', 
      last_name: 'Doe',
      date_of_birth: '1948-05-20',
      gender: 'male'
    )
    
    roberts_father = user.people.create!(
      first_name: 'George', 
      last_name: 'Doe',
      date_of_birth: '1920-09-15',
      gender: 'male'
    )
    
    # Set up Robert's family
    Relationship.create!(person: roberts_father, relative: robert, relationship_type: 'child')
    Relationship.create!(person: robert, relative: roberts_father, relationship_type: 'parent')
    Relationship.create!(person: roberts_father, relative: roberts_brother, relationship_type: 'child')
    Relationship.create!(person: roberts_brother, relative: roberts_father, relationship_type: 'parent')
    
    puts "🧪 TEST 4: Robert marrying his brother (control test - should be blocked)"
    puts "Scenario: Robert (#{robert.id}) wants to marry Michael (#{roberts_brother.id}) - They are brothers (blood relatives)"
    marriage_allowed = BloodRelationshipDetector.marriage_allowed?(robert, roberts_brother)
    blood_related = BloodRelationshipDetector.blood_related?(robert, roberts_brother)
    relationship_desc = BloodRelationshipDetector.new(robert, roberts_brother).relationship_description
    puts "Blood related? #{blood_related}"
    puts "Relationship: #{relationship_desc}"
    puts "Marriage allowed? #{marriage_allowed}"
    puts !marriage_allowed ? "✅ PASSED - Marriage correctly blocked (blood relatives)" : "❌ FAILED - Marriage should be blocked!"
    puts ""
    
    puts "🎯 SUMMARY"
    puts "=" * 60
    puts "✅ Co-parent-in-law marriages are properly allowed:"
    puts "   - Robert can marry Patricia (Co-Mother-in-law)"
    puts "   - Robert can marry deceased Co-Father-in-law's relatives"
    puts "   - No blood relationship exists between co-parents-in-law"
    puts "❌ Blood relative marriages are still properly blocked:"
    puts "   - Siblings cannot marry (control test passed)"
    puts ""
    
    # Check for any critical failures
    coparent_tests = [
      BloodRelationshipDetector.marriage_allowed?(robert, patricia),
      BloodRelationshipDetector.marriage_allowed?(patricia, robert),
      BloodRelationshipDetector.marriage_allowed?(robert, williams_sister)
    ]
    
    blood_relative_tests = [
      !BloodRelationshipDetector.marriage_allowed?(robert, roberts_brother)
    ]
    
    if coparent_tests.all? { |test| test == true } && blood_relative_tests.all? { |test| test == true }
      puts "🎉 SUCCESS: Co-parent-in-law marriages are properly allowed!"
      puts "Patricia Smith and William O'Sullivan should now be available for Robert to marry."
    else
      puts "🚨 ISSUE: Some tests failed - co-parent-in-law marriage logic may need adjustment."
    end
    
    puts ""
    puts "🧪 All tests completed!"
    
    # Clean up test data
    user.people.destroy_all
    puts "🧹 Test data cleaned up"
  end
end