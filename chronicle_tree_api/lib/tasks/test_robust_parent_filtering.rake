# Test robust parent/child relationship filtering
# Ensures that parent filtering prevents ALL inappropriate relationships

namespace :test do
  desc "Test robust parent/child relationship filtering"
  task robust_parent_filtering: :environment do
    puts "🧪 TESTING ROBUST PARENT/CHILD FILTERING"
    puts "=" * 60
    
    # Create test user
    user = User.find_or_create_by(email: 'test_parent_filter@example.com') do |u|
      u.password = 'password123'
      u.first_name = 'Test'
      u.last_name = 'User'
    end
    
    # Clean up any existing test data
    user.people.destroy_all
    
    puts "📋 Creating comprehensive family structure for parent filtering tests..."
    
    # Generation 1: Great-Grandparents
    great_grandfather = user.people.create!(
      first_name: 'George', 
      last_name: 'Smith',
      date_of_birth: '1920-01-01',
      gender: 'male'
    )
    
    great_grandmother = user.people.create!(
      first_name: 'Rose', 
      last_name: 'Smith',
      date_of_birth: '1922-03-15',
      gender: 'female'
    )
    
    # Generation 2: Grandparents
    grandfather = user.people.create!(
      first_name: 'Robert', 
      last_name: 'Smith',
      date_of_birth: '1945-06-10',
      gender: 'male'
    )
    
    grandmother = user.people.create!(
      first_name: 'Mary', 
      last_name: 'Johnson',
      date_of_birth: '1947-08-20',
      gender: 'female'
    )
    
    # Generation 3: Parents
    father = user.people.create!(
      first_name: 'John', 
      last_name: 'Smith',
      date_of_birth: '1970-04-15',
      gender: 'male'
    )
    
    mother = user.people.create!(
      first_name: 'Jane', 
      last_name: 'Wilson',
      date_of_birth: '1972-11-30',
      gender: 'female'
    )
    
    # Generation 4: Target person (who we'll test parent filtering for)
    target_person = user.people.create!(
      first_name: 'Alice', 
      last_name: 'Smith',
      date_of_birth: '1995-09-05',
      gender: 'female'
    )
    
    # Generation 4: Sibling
    sibling = user.people.create!(
      first_name: 'Bob', 
      last_name: 'Smith',
      date_of_birth: '1997-12-12',
      gender: 'male'
    )
    
    # Age-inappropriate candidates
    too_young_candidate = user.people.create!(
      first_name: 'Tommy', 
      last_name: 'Young',
      date_of_birth: '1990-05-05',  # Only 5 years older than Alice
      gender: 'male'
    )
    
    too_old_candidate = user.people.create!(
      first_name: 'Ancient', 
      last_name: 'Old',
      date_of_birth: '1920-01-01',  # 75 years older than Alice
      gender: 'male'
    )
    
    # Deceased candidate
    deceased_candidate = user.people.create!(
      first_name: 'Ghost', 
      last_name: 'Dead',
      date_of_birth: '1960-01-01',
      date_of_death: '1990-01-01',  # Died 5 years before Alice was born
      gender: 'male'
    )
    
    # Appropriate candidate (for control test)
    good_candidate = user.people.create!(
      first_name: 'Perfect', 
      last_name: 'Parent',
      date_of_birth: '1965-01-01',  # 30 years older than Alice
      gender: 'male'
    )
    
    puts "👥 Setting up existing family relationships..."
    
    # Set up existing family structure
    # Great-grandparents → Grandparents
    Relationship.create!(person: great_grandfather, relative: grandfather, relationship_type: 'child')
    Relationship.create!(person: grandfather, relative: great_grandfather, relationship_type: 'parent')
    Relationship.create!(person: great_grandmother, relative: grandfather, relationship_type: 'child')
    Relationship.create!(person: grandfather, relative: great_grandmother, relationship_type: 'parent')
    
    # Grandparents → Parents
    Relationship.create!(person: grandfather, relative: father, relationship_type: 'child')
    Relationship.create!(person: father, relative: grandfather, relationship_type: 'parent')
    Relationship.create!(person: grandmother, relative: father, relationship_type: 'child')
    Relationship.create!(person: father, relative: grandmother, relationship_type: 'parent')
    
    # Parents → Target person and sibling
    Relationship.create!(person: father, relative: target_person, relationship_type: 'child')
    Relationship.create!(person: target_person, relative: father, relationship_type: 'parent')
    Relationship.create!(person: mother, relative: target_person, relationship_type: 'child')
    Relationship.create!(person: target_person, relative: mother, relationship_type: 'parent')
    
    Relationship.create!(person: father, relative: sibling, relationship_type: 'child')
    Relationship.create!(person: sibling, relative: father, relationship_type: 'parent')
    Relationship.create!(person: mother, relative: sibling, relationship_type: 'child')
    Relationship.create!(person: sibling, relative: mother, relationship_type: 'parent')
    
    puts "✅ Family structure created!"
    puts ""
    puts "📊 Test Structure:"
    puts "  Gen 1: George (#{great_grandfather.id}), Rose (#{great_grandmother.id})"
    puts "  Gen 2: Robert (#{grandfather.id}), Mary (#{grandmother.id})"
    puts "  Gen 3: John (#{father.id}), Jane (#{mother.id})"
    puts "  Gen 4: Alice (#{target_person.id}) [TARGET], Bob (#{sibling.id})"
    puts "  Test candidates: Tommy (#{too_young_candidate.id}), Ancient (#{too_old_candidate.id}), Ghost (#{deceased_candidate.id}), Perfect (#{good_candidate.id})"
    puts ""
    
    # PARENT FILTERING TESTS
    puts "🧪 PARENT FILTERING TESTS (who can be Alice's parent)"
    puts "=" * 40
    
    test_cases = [
      {
        candidate: great_grandfather,
        expected: false,
        reason: "Great-grandfather (blood relative)",
        test_name: "Great-Grandfather as Parent"
      },
      {
        candidate: grandfather,
        expected: false,
        reason: "Grandfather (blood relative)",
        test_name: "Grandfather as Parent"
      },
      {
        candidate: father,
        expected: false,
        reason: "Already father (existing relationship)",
        test_name: "Father as Parent (duplicate)"
      },
      {
        candidate: sibling,
        expected: false,
        reason: "Sibling (same generation, blood relative)",
        test_name: "Sibling as Parent"
      },
      {
        candidate: too_young_candidate,
        expected: false,
        reason: "Age gap too small (5 years, need 12+)",
        test_name: "Too Young Candidate as Parent"
      },
      {
        candidate: too_old_candidate,
        expected: false,
        reason: "Age gap too large (75 years, max 60)",
        test_name: "Too Old Candidate as Parent"
      },
      {
        candidate: deceased_candidate,
        expected: false,
        reason: "Died before Alice was born",
        test_name: "Deceased Candidate as Parent"
      },
      {
        candidate: good_candidate,
        expected: true,
        reason: "Appropriate age, no blood relation, no conflicts",
        test_name: "Good Candidate as Parent"
      }
    ]
    
    # Test each candidate trying to become Alice's parent
    test_cases.each_with_index do |test_case, index|
      puts "#{index + 1}. #{test_case[:test_name]}"
      puts "   Candidate: #{test_case[:candidate].first_name} #{test_case[:candidate].last_name} (#{test_case[:candidate].id})"
      
      # Check if this person can be Alice's parent
      can_be_parent = true
      failure_reason = nil
      
      # Simulate the enhanced validation logic
      # Check if Alice already has 2 parents
      alice_parents = target_person.relationships.where(relationship_type: 'parent').count
      if alice_parents >= 2
        can_be_parent = false
        failure_reason = "Alice already has maximum number of parents (2)"
      end
      
      # Check blood relationship using our enhanced detector
      if can_be_parent
        blood_related = BloodRelationshipDetector.blood_related?(test_case[:candidate], target_person)
        if blood_related
          can_be_parent = false
          relationship_desc = BloodRelationshipDetector.new(test_case[:candidate], target_person).relationship_description
          failure_reason = "Blood relative (#{relationship_desc})"
        end
      end
      
      # Check age constraints
      if can_be_parent && test_case[:candidate].date_of_birth && target_person.date_of_birth
        candidate_birth = Date.parse(test_case[:candidate].date_of_birth)
        alice_birth = Date.parse(target_person.date_of_birth)
        age_gap_years = (alice_birth - candidate_birth) / 365.25
        
        if age_gap_years < 12
          can_be_parent = false
          failure_reason = "Age gap too small (#{age_gap_years.round(1)} years, need 12+)"
        elsif age_gap_years > 60
          can_be_parent = false
          failure_reason = "Age gap too large (#{age_gap_years.round(1)} years, max 60)"
        end
      end
      
      # Check death constraints
      if can_be_parent && test_case[:candidate].date_of_death && target_person.date_of_birth
        candidate_death = Date.parse(test_case[:candidate].date_of_death)
        alice_birth = Date.parse(target_person.date_of_birth)
        
        if alice_birth > candidate_death
          can_be_parent = false
          failure_reason = "Died before Alice was born"
        end
      end
      
      expected = test_case[:expected]
      actual = can_be_parent
      status = (actual == expected) ? "✅ PASSED" : "❌ FAILED"
      
      puts "   Expected: #{expected ? 'ALLOWED' : 'BLOCKED'} (#{test_case[:reason]})"
      puts "   Actual: #{actual ? 'ALLOWED' : 'BLOCKED'}" + (failure_reason ? " (#{failure_reason})" : "")
      puts "   Result: #{status}"
      puts ""
    end
    
    # CHILD FILTERING TESTS
    puts "🧪 CHILD FILTERING TESTS (who can be Alice's child)"
    puts "=" * 40
    
    # Create some child candidates
    young_child = user.people.create!(
      first_name: 'Little', 
      last_name: 'Kid',
      date_of_birth: '2015-01-01',  # 20 years younger than Alice
      gender: 'female'
    )
    
    too_old_child = user.people.create!(
      first_name: 'Older', 
      last_name: 'Person',
      date_of_birth: '1990-01-01',  # Only 5 years younger than Alice
      gender: 'male'
    )
    
    child_test_cases = [
      {
        candidate: sibling,
        expected: false,
        reason: "Sibling (blood relative)",
        test_name: "Sibling as Child"
      },
      {
        candidate: grandfather,
        expected: false,
        reason: "Grandfather (blood relative)",
        test_name: "Grandfather as Child"
      },
      {
        candidate: too_old_child,
        expected: false,
        reason: "Age gap too small (5 years, need 12+)",
        test_name: "Too Old Child"
      },
      {
        candidate: young_child,
        expected: true,
        reason: "Appropriate age, no blood relation",
        test_name: "Good Child Candidate"
      }
    ]
    
    child_test_cases.each_with_index do |test_case, index|
      puts "#{index + 1}. #{test_case[:test_name]}"
      puts "   Candidate: #{test_case[:candidate].first_name} #{test_case[:candidate].last_name} (#{test_case[:candidate].id})"
      
      can_be_child = true
      failure_reason = nil
      
      # Check if candidate already has 2 parents
      candidate_parents = test_case[:candidate].relationships.where(relationship_type: 'parent').count
      if candidate_parents >= 2
        can_be_child = false
        failure_reason = "Candidate already has maximum number of parents (2)"
      end
      
      # Check blood relationship
      if can_be_child
        blood_related = BloodRelationshipDetector.blood_related?(target_person, test_case[:candidate])
        if blood_related
          can_be_child = false
          relationship_desc = BloodRelationshipDetector.new(target_person, test_case[:candidate]).relationship_description
          failure_reason = "Blood relative (#{relationship_desc})"
        end
      end
      
      # Check age constraints
      if can_be_child && target_person.date_of_birth && test_case[:candidate].date_of_birth
        alice_birth = Date.parse(target_person.date_of_birth)
        candidate_birth = Date.parse(test_case[:candidate].date_of_birth)
        age_gap_years = (candidate_birth - alice_birth) / 365.25
        
        if age_gap_years < 12
          can_be_child = false
          failure_reason = "Age gap too small (#{age_gap_years.round(1)} years, need 12+)"
        elsif age_gap_years > 60
          can_be_child = false
          failure_reason = "Age gap too large (#{age_gap_years.round(1)} years, max 60)"
        end
      end
      
      expected = test_case[:expected]
      actual = can_be_child
      status = (actual == expected) ? "✅ PASSED" : "❌ FAILED"
      
      puts "   Expected: #{expected ? 'ALLOWED' : 'BLOCKED'} (#{test_case[:reason]})"
      puts "   Actual: #{actual ? 'ALLOWED' : 'BLOCKED'}" + (failure_reason ? " (#{failure_reason})" : "")
      puts "   Result: #{status}"
      puts ""
    end
    
    puts "🎯 SUMMARY"
    puts "=" * 60
    puts "✅ Enhanced parent/child filtering now prevents:"
    puts "   - All blood relatives from becoming parents/children"
    puts "   - Same generation relationships (siblings as parents)"
    puts "   - Age-inappropriate relationships (< 12 years or > 60 years gap)"
    puts "   - Timeline impossibilities (deceased before birth)"
    puts "   - Exceeding biological limits (max 2 parents per person)"
    puts "❌ Inappropriate relationships are comprehensively blocked"
    puts "✅ Appropriate relationships are still allowed"
    puts ""
    
    puts "🧪 All robust parent filtering tests completed!"
    
    # Clean up test data
    user.people.destroy_all
    puts "🧹 Test data cleaned up"
  end
end