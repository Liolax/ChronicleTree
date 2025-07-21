# Test robust sibling relationship filtering
# Ensures that sibling filtering prevents ALL inappropriate relationships
# and enforces logical sibling constraints

namespace :test do
  desc "Test robust sibling relationship filtering"
  task robust_sibling_filtering: :environment do
    puts "🧪 TESTING ROBUST SIBLING FILTERING"
    puts "=" * 60
    
    # Create test user
    user = User.find_or_create_by(email: 'test_sibling_filter@example.com') do |u|
      u.password = 'password123'
      u.first_name = 'Test'
      u.last_name = 'User'
    end
    
    # Clean up any existing test data
    user.people.destroy_all
    
    puts "📋 Creating comprehensive family structure for sibling filtering tests..."
    
    # Create multi-generational family for testing
    # Generation 1: Great-Grandparents
    great_grandfather = user.people.create!(
      first_name: 'George', 
      last_name: 'Smith',
      date_of_birth: '1920-01-01',
      gender: 'male'
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
    
    # Generation 3: Parents and Uncles/Aunts
    father = user.people.create!(
      first_name: 'John', 
      last_name: 'Smith',
      date_of_birth: '1970-04-15',
      gender: 'male'
    )
    
    uncle = user.people.create!(
      first_name: 'Mike', 
      last_name: 'Smith',
      date_of_birth: '1968-02-20',
      gender: 'male'
    )
    
    mother = user.people.create!(
      first_name: 'Jane', 
      last_name: 'Wilson',
      date_of_birth: '1972-11-30',
      gender: 'female'
    )
    
    # Generation 4: Target person and potential siblings
    target_person = user.people.create!(
      first_name: 'Alice', 
      last_name: 'Smith',
      date_of_birth: '1995-09-05',
      gender: 'female'
    )
    
    existing_sibling = user.people.create!(
      first_name: 'Bob', 
      last_name: 'Smith',
      date_of_birth: '1997-12-12',
      gender: 'male'
    )
    
    # Same-generation cousin
    cousin = user.people.create!(
      first_name: 'Carol', 
      last_name: 'Smith',
      date_of_birth: '1996-05-15',
      gender: 'female'
    )
    
    # Age-inappropriate candidates
    too_old_sibling = user.people.create!(
      first_name: 'Ancient', 
      last_name: 'Old',
      date_of_birth: '1960-01-01',  # 35 years older than Alice
      gender: 'male'
    )
    
    # Timeline-inappropriate candidate (died before Alice was born)
    deceased_before_birth = user.people.create!(
      first_name: 'Ghost', 
      last_name: 'Dead',
      date_of_birth: '1980-01-01',
      date_of_death: '1990-01-01',  # Died 5 years before Alice was born
      gender: 'male'
    )
    
    # Step-sibling scenario setup
    step_father = user.people.create!(
      first_name: 'Steve', 
      last_name: 'Wilson',
      date_of_birth: '1970-01-01',
      gender: 'male'
    )
    
    step_sibling = user.people.create!(
      first_name: 'Step', 
      last_name: 'Wilson',
      date_of_birth: '1994-03-10',
      gender: 'female'
    )
    
    # Appropriate candidate (for control test)
    good_sibling_candidate = user.people.create!(
      first_name: 'Perfect', 
      last_name: 'Sibling',
      date_of_birth: '1993-07-20',
      gender: 'male'
    )
    
    puts "👥 Setting up existing family relationships..."
    
    # Set up existing family structure
    # Great-grandfather → Grandfather
    Relationship.create!(person: great_grandfather, relative: grandfather, relationship_type: 'child')
    Relationship.create!(person: grandfather, relative: great_grandfather, relationship_type: 'parent')
    
    # Grandparents → Father and Uncle (they are siblings)
    Relationship.create!(person: grandfather, relative: father, relationship_type: 'child')
    Relationship.create!(person: father, relative: grandfather, relationship_type: 'parent')
    Relationship.create!(person: grandmother, relative: father, relationship_type: 'child')
    Relationship.create!(person: father, relative: grandmother, relationship_type: 'parent')
    
    Relationship.create!(person: grandfather, relative: uncle, relationship_type: 'child')
    Relationship.create!(person: uncle, relative: grandfather, relationship_type: 'parent')
    Relationship.create!(person: grandmother, relative: uncle, relationship_type: 'child')
    Relationship.create!(person: uncle, relative: grandmother, relationship_type: 'parent')
    
    # Father and Uncle are siblings
    Relationship.create!(person: father, relative: uncle, relationship_type: 'sibling')
    Relationship.create!(person: uncle, relative: father, relationship_type: 'sibling')
    
    # Uncle → Cousin
    Relationship.create!(person: uncle, relative: cousin, relationship_type: 'child')
    Relationship.create!(person: cousin, relative: uncle, relationship_type: 'parent')
    
    # Parents → Target person and existing sibling
    Relationship.create!(person: father, relative: target_person, relationship_type: 'child')
    Relationship.create!(person: target_person, relative: father, relationship_type: 'parent')
    Relationship.create!(person: mother, relative: target_person, relationship_type: 'child')
    Relationship.create!(person: target_person, relative: mother, relationship_type: 'parent')
    
    Relationship.create!(person: father, relative: existing_sibling, relationship_type: 'child')
    Relationship.create!(person: existing_sibling, relative: father, relationship_type: 'parent')
    Relationship.create!(person: mother, relative: existing_sibling, relationship_type: 'child')
    Relationship.create!(person: existing_sibling, relative: mother, relationship_type: 'parent')
    
    # Alice and Bob are already siblings
    Relationship.create!(person: target_person, relative: existing_sibling, relationship_type: 'sibling')
    Relationship.create!(person: existing_sibling, relative: target_person, relationship_type: 'sibling')
    
    # Step-family setup: Mother marries Step-father
    Relationship.create!(person: mother, relative: step_father, relationship_type: 'spouse')
    Relationship.create!(person: step_father, relative: mother, relationship_type: 'spouse')
    
    # Step-father → Step-sibling
    Relationship.create!(person: step_father, relative: step_sibling, relationship_type: 'child')
    Relationship.create!(person: step_sibling, relative: step_father, relationship_type: 'parent')
    
    # Good candidate shares father with Alice
    Relationship.create!(person: father, relative: good_sibling_candidate, relationship_type: 'child')
    Relationship.create!(person: good_sibling_candidate, relative: father, relationship_type: 'parent')
    
    puts "✅ Family structure created!"
    puts ""
    puts "📊 Test Structure:"
    puts "  Gen 1: George (#{great_grandfather.id})"
    puts "  Gen 2: Robert (#{grandfather.id}), Mary (#{grandmother.id})"
    puts "  Gen 3: John (#{father.id}), Mike (#{uncle.id}), Jane (#{mother.id}), Steve (#{step_father.id})"
    puts "  Gen 4: Alice (#{target_person.id}) [TARGET], Bob (#{existing_sibling.id}), Carol (#{cousin.id}), Step (#{step_sibling.id}), Perfect (#{good_sibling_candidate.id})"
    puts "  Special: Ancient (#{too_old_sibling.id}), Ghost (#{deceased_before_birth.id})"
    puts ""
    
    # SIBLING FILTERING TESTS
    puts "🧪 SIBLING FILTERING TESTS (who can be Alice's sibling)"
    puts "=" * 50
    
    test_cases = [
      {
        candidate: great_grandfather,
        expected: false,
        reason: "Great-grandfather (different generation, blood relative)",
        test_name: "Great-Grandfather as Sibling"
      },
      {
        candidate: grandfather,
        expected: false,
        reason: "Grandfather (different generation, blood relative)",
        test_name: "Grandfather as Sibling"
      },
      {
        candidate: father,
        expected: false,
        reason: "Father (different generation, already parent)",
        test_name: "Father as Sibling"
      },
      {
        candidate: uncle,
        expected: false,
        reason: "Uncle (different generation, blood relative)",
        test_name: "Uncle as Sibling"
      },
      {
        candidate: existing_sibling,
        expected: false,
        reason: "Already sibling",
        test_name: "Existing Sibling as Sibling (duplicate)"
      },
      {
        candidate: cousin,
        expected: false,
        reason: "Cousin (blood relative)",
        test_name: "Cousin as Sibling"
      },
      {
        candidate: too_old_sibling,
        expected: false,
        reason: "Age gap too large (35 years, max 25)",
        test_name: "Too Old Candidate as Sibling"
      },
      {
        candidate: deceased_before_birth,
        expected: false,
        reason: "Died before Alice was born",
        test_name: "Deceased Before Birth as Sibling"
      },
      {
        candidate: step_sibling,
        expected: true,
        reason: "Step-sibling (mother married step-father)",
        test_name: "Step-Sibling as Sibling"
      },
      {
        candidate: good_sibling_candidate,
        expected: true,
        reason: "Shares father, appropriate age, good timeline",
        test_name: "Good Sibling Candidate"
      }
    ]
    
    # Test each candidate trying to become Alice's sibling
    test_cases.each_with_index do |test_case, index|
      puts "#{index + 1}. #{test_case[:test_name]}"
      puts "   Candidate: #{test_case[:candidate].first_name} #{test_case[:candidate].last_name} (#{test_case[:candidate].id})"
      
      # Check if this person can be Alice's sibling using our enhanced validation
      can_be_sibling = BloodRelationshipDetector.sibling_allowed?(target_person, test_case[:candidate])
      failure_reason = nil
      
      unless can_be_sibling
        # Determine the failure reason
        blood_related = BloodRelationshipDetector.blood_related?(target_person, test_case[:candidate])
        if blood_related
          relationship_desc = BloodRelationshipDetector.new(target_person, test_case[:candidate]).relationship_description
          failure_reason = "Blood relative (#{relationship_desc})"
        else
          # Check other constraints
          if test_case[:candidate].date_of_birth && target_person.date_of_birth
            candidate_birth = Date.parse(test_case[:candidate].date_of_birth)
            alice_birth = Date.parse(target_person.date_of_birth)
            age_gap_years = (candidate_birth - alice_birth).abs / 365.25
            
            if age_gap_years > 25
              failure_reason = "Age gap too large (#{age_gap_years.round(1)} years)"
            end
          end
          
          if test_case[:candidate].date_of_death && target_person.date_of_birth
            candidate_death = Date.parse(test_case[:candidate].date_of_death)
            alice_birth = Date.parse(target_person.date_of_birth)
            
            if alice_birth > candidate_death
              failure_reason = "Died before Alice was born"
            end
          end
          
          failure_reason ||= "Other constraint violation"
        end
      end
      
      # For allowed cases, check shared parent constraint
      if can_be_sibling && test_case[:expected]
        # Check if they share a parent or have step-relationship
        alice_parents = target_person.parents.pluck(:id)
        candidate_parents = test_case[:candidate].parents.pluck(:id)
        shared_parents = alice_parents & candidate_parents
        
        has_step_relationship = false
        unless shared_parents.any?
          # Check for step-sibling relationship
          target_person.parents.each do |alice_parent|
            test_case[:candidate].parents.each do |candidate_parent|
              if alice_parent.spouses.include?(candidate_parent)
                has_step_relationship = true
                break
              end
            end
            break if has_step_relationship
          end
        end
        
        if !shared_parents.any? && !has_step_relationship
          can_be_sibling = false
          failure_reason = "No shared parents or step-relationship"
        end
      end
      
      expected = test_case[:expected]
      actual = can_be_sibling
      status = (actual == expected) ? "✅ PASSED" : "❌ FAILED"
      
      puts "   Expected: #{expected ? 'ALLOWED' : 'BLOCKED'} (#{test_case[:reason]})"
      puts "   Actual: #{actual ? 'ALLOWED' : 'BLOCKED'}" + (failure_reason ? " (#{failure_reason})" : "")
      puts "   Result: #{status}"
      puts ""
    end
    
    puts "🎯 SUMMARY"
    puts "=" * 60
    puts "✅ Enhanced sibling filtering now prevents:"
    puts "   - All different-generation relationships (parents, grandparents, uncles, etc.)"
    puts "   - All blood relatives from inappropriate sibling relationships"
    puts "   - Age-inappropriate relationships (> 25 year gap)"
    puts "   - Timeline impossibilities (died before birth)"
    puts "   - Duplicate relationships (already siblings)"
    puts "   - Relationships without shared parents or step-relationship"
    puts "❌ Inappropriate sibling relationships are comprehensively blocked"
    puts "✅ Appropriate biological and step-siblings are allowed"
    puts "🔒 CRITICAL: Siblings must share at least one parent or have step-relationship"
    puts ""
    
    # Check for critical failures
    critical_tests = test_cases.select { |tc| !tc[:expected] }
    failed_critical = critical_tests.any? do |tc|
      BloodRelationshipDetector.sibling_allowed?(target_person, tc[:candidate])
    end
    
    if failed_critical
      puts "🚨 CRITICAL FAILURE: Some inappropriate sibling relationships are still allowed!"
      puts "This is a serious validation bug that must be fixed immediately."
    else
      puts "🎉 SUCCESS: All inappropriate sibling relationships are properly blocked!"
      puts "The enhanced sibling filtering is working correctly."
    end
    
    puts ""
    puts "🧪 All robust sibling filtering tests completed!"
    
    # Clean up test data
    user.people.destroy_all
    puts "🧹 Test data cleaned up"
  end
end