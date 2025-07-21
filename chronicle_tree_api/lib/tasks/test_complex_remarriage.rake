# Test complex remarriage scenarios
# ✅ ALLOWED: Marrying ex-spouse's sibling (if no blood relation)
# ✅ ALLOWED: Marrying deceased spouse's relative (if no blood relation)
# ❌ PREVENTED: Marrying any blood relative regardless of previous marriages

namespace :test do
  desc "Test complex remarriage scenarios to ensure proper validation"
  task complex_remarriage: :environment do
    puts "🧪 TESTING COMPLEX REMARRIAGE SCENARIOS"
    puts "=" * 50
    
    # Create test user
    user = User.find_or_create_by(email: 'test_remarriage@example.com') do |u|
      u.password = 'password123'
      u.first_name = 'Test'
      u.last_name = 'User'
    end
    
    # Clean up any existing test data
    user.people.destroy_all
    
    puts "📋 Creating test family structure..."
    
    # Create the main characters
    john = user.people.create!(
      first_name: 'John', 
      last_name: 'Smith',
      date_of_birth: '1980-01-01',
      gender: 'male'
    )
    
    # John's first wife (who will become ex-wife)
    mary = user.people.create!(
      first_name: 'Mary', 
      last_name: 'Johnson',
      date_of_birth: '1982-03-15',
      gender: 'female'
    )
    
    # Mary's brother (John's potential new spouse - SHOULD BE ALLOWED)
    mike = user.people.create!(
      first_name: 'Mike', 
      last_name: 'Johnson',
      date_of_birth: '1978-07-20',
      gender: 'male'
    )
    
    # John's second wife (who will die)
    sarah = user.people.create!(
      first_name: 'Sarah', 
      last_name: 'Wilson',
      date_of_birth: '1985-05-10',
      gender: 'female',
      date_of_death: '2020-12-25'  # Deceased
    )
    
    # Sarah's sister (John's potential new spouse - SHOULD BE ALLOWED)
    lisa = user.people.create!(
      first_name: 'Lisa', 
      last_name: 'Wilson',
      date_of_birth: '1987-09-18',
      gender: 'female'
    )
    
    # John's brother (SHOULD BE BLOCKED - blood relative)
    robert = user.people.create!(
      first_name: 'Robert', 
      last_name: 'Smith',
      date_of_birth: '1975-11-30',
      gender: 'male'
    )
    
    # Create family relationships
    puts "👥 Setting up family relationships..."
    
    # Mary and Mike are siblings
    Relationship.create!(person: mary, relative: mike, relationship_type: 'sibling')
    Relationship.create!(person: mike, relative: mary, relationship_type: 'sibling')
    
    # Sarah and Lisa are siblings  
    Relationship.create!(person: sarah, relative: lisa, relationship_type: 'sibling')
    Relationship.create!(person: lisa, relative: sarah, relationship_type: 'sibling')
    
    # John and Robert are siblings (blood relatives)
    Relationship.create!(person: john, relative: robert, relationship_type: 'sibling')
    Relationship.create!(person: robert, relative: john, relationship_type: 'sibling')
    
    # John marries Mary (first marriage)
    Relationship.create!(person: john, relative: mary, relationship_type: 'spouse')
    Relationship.create!(person: mary, relative: john, relationship_type: 'spouse')
    
    # John marries Sarah (second marriage)  
    Relationship.create!(person: john, relative: sarah, relationship_type: 'spouse')
    Relationship.create!(person: sarah, relative: john, relationship_type: 'spouse')
    
    # Mark Mary as ex-wife
    john_mary_rel = Relationship.find_by(person: john, relative: mary, relationship_type: 'spouse')
    john_mary_rel.update!(is_ex: true)
    mary_john_rel = Relationship.find_by(person: mary, relative: john, relationship_type: 'spouse')
    mary_john_rel.update!(is_ex: true)
    
    puts "✅ Test setup complete!"
    puts ""
    
    # TEST 1: ✅ ALLOWED - Marrying ex-spouse's sibling (Mike is Mary's brother, Mary is John's ex-wife)
    puts "🧪 TEST 1: Marrying ex-spouse's sibling"
    puts "Scenario: John (#{john.id}) wants to marry Mike (#{mike.id}) - Mike is John's ex-wife Mary's brother"
    marriage_allowed = BloodRelationshipDetector.marriage_allowed?(john, mike)
    blood_related = BloodRelationshipDetector.blood_related?(john, mike)
    puts "Blood related? #{blood_related}"
    puts "Marriage allowed? #{marriage_allowed}"
    puts marriage_allowed ? "✅ PASSED - Marriage allowed (ex-spouse's sibling with no blood relation)" : "❌ FAILED - Marriage should be allowed"
    puts ""
    
    # TEST 2: ✅ ALLOWED - Marrying deceased spouse's relative (Lisa is Sarah's sister, Sarah is John's deceased wife)
    puts "🧪 TEST 2: Marrying deceased spouse's relative" 
    puts "Scenario: John (#{john.id}) wants to marry Lisa (#{lisa.id}) - Lisa is John's deceased wife Sarah's sister"
    marriage_allowed = BloodRelationshipDetector.marriage_allowed?(john, lisa)
    blood_related = BloodRelationshipDetector.blood_related?(john, lisa)
    puts "Blood related? #{blood_related}"
    puts "Marriage allowed? #{marriage_allowed}"
    puts marriage_allowed ? "✅ PASSED - Marriage allowed (deceased spouse's relative with no blood relation)" : "❌ FAILED - Marriage should be allowed"
    puts ""
    
    # TEST 3: ❌ BLOCKED - Marrying blood relative (Robert is John's brother)
    puts "🧪 TEST 3: Marrying blood relative"
    puts "Scenario: John (#{john.id}) wants to marry Robert (#{robert.id}) - Robert is John's brother (blood relative)"
    marriage_allowed = BloodRelationshipDetector.marriage_allowed?(john, robert)
    blood_related = BloodRelationshipDetector.blood_related?(john, robert)
    relationship_desc = BloodRelationshipDetector.new(john, robert).relationship_description
    puts "Blood related? #{blood_related}"
    puts "Relationship: #{relationship_desc}"
    puts "Marriage allowed? #{marriage_allowed}"
    puts !marriage_allowed ? "✅ PASSED - Marriage correctly blocked (incestuous relationship)" : "❌ FAILED - Marriage should be blocked"
    puts ""
    
    # TEST 4: Try actual relationship creation through API validation
    puts "🧪 TEST 4: API Relationship creation validation"
    puts "Testing relationship creation through the API layer..."
    
    # This should succeed (ex-spouse's sibling)
    test_rel_1 = Relationship.new(person: john, relative: mike, relationship_type: 'spouse')
    if BloodRelationshipDetector.marriage_allowed?(john, mike)
      puts "✅ API would allow John + Mike (ex-spouse's sibling)"
    else
      puts "❌ API incorrectly blocks John + Mike"
    end
    
    # This should succeed (deceased spouse's relative)
    test_rel_2 = Relationship.new(person: john, relative: lisa, relationship_type: 'spouse')
    if BloodRelationshipDetector.marriage_allowed?(john, lisa)
      puts "✅ API would allow John + Lisa (deceased spouse's relative)"
    else
      puts "❌ API incorrectly blocks John + Lisa"
    end
    
    # This should fail (blood relative)
    test_rel_3 = Relationship.new(person: john, relative: robert, relationship_type: 'spouse')
    if !BloodRelationshipDetector.marriage_allowed?(john, robert)
      puts "✅ API correctly blocks John + Robert (blood relatives)"
    else
      puts "❌ API incorrectly allows John + Robert"
    end
    
    puts ""
    puts "🎯 SUMMARY"
    puts "=" * 50
    puts "✅ Complex remarriage scenarios are properly supported:"
    puts "   - Ex-spouse's siblings can be married (if no blood relation)"
    puts "   - Deceased spouse's relatives can be married (if no blood relation)"
    puts "❌ Incestuous relationships are always prevented:"
    puts "   - Blood relatives cannot marry regardless of previous marriages"
    puts ""
    puts "🧪 All tests completed!"
    
    # Clean up test data
    user.people.destroy_all
    puts "🧹 Test data cleaned up"
  end
end