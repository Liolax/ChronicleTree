# frozen_string_literal: true

# Calculates relationships between people for share images
# Uses same logic as frontend relationship calculator
class UnifiedRelationshipCalculator
  def initialize(user)
    @user = user
    @all_people = user.people.to_a
    @relationships_data = build_relationships_data
  end

  # Calculate relationships for a person
  def calculate_relationships_for_person(person)
    person_id = person.id
    
    # Build data structure like frontend calculator
    results = {
      person: person,
      relationships: {},
      stats: calculate_relationship_statistics(person)
    }
    
    @all_people.each do |other_person|
      next if other_person.id == person_id
      
      relationship = calculate_relationship_between(person, other_person)
      if relationship && relationship != 'unrelated'
        results[:relationships][other_person.id] = {
          person: other_person,
          relationship: relationship,
          relationship_type: classify_relationship_type(relationship)
        }
      end
    end
    
    results
  end
  
  # Count different types of relationships
  def calculate_relationship_statistics(person)
    stats = {
      children: 0,
      step_children: 0,
      spouses: 0,
      ex_spouses: 0,
      siblings: 0,
      step_siblings: 0,
      half_siblings: 0,
      parents: 0,
      step_parents: 0,
      grandparents: 0,
      step_grandparents: 0,
      grandchildren: 0,
      aunts_uncles: 0,
      cousins: 0,
      in_laws: 0
    }
    
    # Count biological children
    biological_children = @relationships_data.select do |rel|
      rel[:source] == person.id && rel[:relationship_type] == 'child'
    end
    stats[:children] = biological_children.count
    
    # Count step-children through current/deceased spouses (NOT ex-spouses)
    current_and_deceased_spouses = @relationships_data.select do |rel|
      rel[:source] == person.id && 
      rel[:relationship_type] == 'spouse' && 
      !rel[:is_ex]  # Only current and deceased, not ex
    end
    
    step_children_count = 0
    current_and_deceased_spouses.each do |spouse_rel|
      spouse_id = spouse_rel[:target]
      
      # Find spouse's children who are not also person's biological children
      spouse_children = @relationships_data.select do |rel|
        rel[:source] == spouse_id && rel[:relationship_type] == 'child'
      end
      
      spouse_children.each do |child_rel|
        # Check if this child is also person's biological child
        is_biological_child = biological_children.any? { |bio_rel| bio_rel[:target] == child_rel[:target] }
        step_children_count += 1 unless is_biological_child
      end
    end
    stats[:step_children] = step_children_count
    
    # Count current spouses (not ex-spouses)
    current_spouses = @relationships_data.select do |rel|
      rel[:source] == person.id && 
      rel[:relationship_type] == 'spouse' && 
      !rel[:is_ex]
    end
    stats[:spouses] = current_spouses.count
    
    # Count ex-spouses
    ex_spouses = @relationships_data.select do |rel|
      rel[:source] == person.id && 
      rel[:relationship_type] == 'spouse' && 
      rel[:is_ex]
    end
    stats[:ex_spouses] = ex_spouses.count
    
    # Count biological siblings
    biological_siblings = @relationships_data.select do |rel|
      rel[:source] == person.id && rel[:relationship_type] == 'sibling'
    end
    stats[:siblings] = biological_siblings.count
    
    # Count step-siblings through parents' current/deceased spouses
    parents = @relationships_data.select do |rel|
      rel[:source] == person.id && rel[:relationship_type] == 'parent'
    end
    
    step_siblings_count = 0
    half_siblings_count = 0
    
    parents.each do |parent_rel|
      parent_id = parent_rel[:target]
      
      # Get parent's current/deceased spouses (exclude ex-spouses)
      parent_spouses = @relationships_data.select do |rel|
        rel[:source] == parent_id && 
        rel[:relationship_type] == 'spouse' && 
        !rel[:is_ex]  # Only current and deceased, not ex
      end
      
      parent_spouses.each do |spouse_rel|
        spouse_id = spouse_rel[:target]
        
        # Find spouse's children who are not person's biological siblings
        spouse_children = @relationships_data.select do |rel|
          rel[:source] == spouse_id && 
          rel[:relationship_type] == 'child' &&
          rel[:target] != person.id  # Skip self
        end
        
        spouse_children.each do |child_rel|
          # Check if this is a biological sibling or half-sibling
          is_biological_sibling = biological_siblings.any? { |sib_rel| sib_rel[:target] == child_rel[:target] }
          
          unless is_biological_sibling
            # Check if it's a half-sibling (shares one parent)
            child_person_id = child_rel[:target]
            child_parents = @relationships_data.select do |rel|
              rel[:source] == child_person_id && rel[:relationship_type] == 'parent'
            end
            
            person_parents = parents.map { |p| p[:target] }
            child_parent_ids = child_parents.map { |p| p[:target] }
            shared_parents = person_parents & child_parent_ids
            
            if shared_parents.length == 1
              half_siblings_count += 1
            elsif shared_parents.empty?
              step_siblings_count += 1
            end
          end
        end
      end
    end
    
    stats[:step_siblings] = step_siblings_count
    stats[:half_siblings] = half_siblings_count
    
    # Count parents and step-parents
    stats[:parents] = parents.count
    
    step_parents_count = 0
    parents.each do |parent_rel|
      parent_id = parent_rel[:target]
      
      # Get parent's current/deceased spouses (exclude ex-spouses)
      parent_spouses = @relationships_data.select do |rel|
        rel[:source] == parent_id && 
        rel[:relationship_type] == 'spouse' && 
        !rel[:is_ex]  # Only current and deceased, not ex
      end
      
      parent_spouses.each do |spouse_rel|
        spouse_id = spouse_rel[:target]
        
        # Check if this spouse is also person's biological parent
        is_biological_parent = parents.any? { |par_rel| par_rel[:target] == spouse_id }
        step_parents_count += 1 unless is_biological_parent
      end
    end
    stats[:step_parents] = step_parents_count
    
    stats
  end
  
  private
  
  def build_relationships_data
    relationships = []
    
    @all_people.each do |person|
      person.relationships.each do |rel|
        if @all_people.map(&:id).include?(rel.relative_id)
          relationships << {
            source: person.id,
            target: rel.relative_id,
            relationship_type: rel.relationship_type,
            is_ex: rel.is_ex || false,
            is_deceased: rel.is_deceased || false
          }
        end
      end
    end
    
    relationships
  end
  
  def calculate_relationship_between(person1, person2)
    # Calculate relationship between two people
    # Uses same logic as frontend calculator
    # Basic implementation for now
    
    # Check direct relationships first - prioritize person1 as source
    direct_rel = @relationships_data.find do |rel|
      rel[:source] == person1.id && rel[:target] == person2.id
    end
    
    # If no relationship with person1 as source, check reverse direction  
    unless direct_rel
      direct_rel = @relationships_data.find do |rel|
        rel[:source] == person2.id && rel[:target] == person1.id
      end
    end
    
    if direct_rel
      return format_relationship_label(direct_rel, person1, person2)
    end
    
    # Check for step-relationships, in-laws, etc.
    # This would need the full relationship calculation algorithm from the frontend
    
    'unrelated'
  end
  
  def format_relationship_label(relationship, person1, person2)
    case relationship[:relationship_type]
    when 'spouse'
      if relationship[:is_ex]
        return 'Ex-Spouse' unless person2.gender.present?
        person2.gender.downcase == 'male' ? 'Ex-Husband' : 'Ex-Wife'
      else
        # Apply perspective-based deceased spouse logic
        base_type = person2.gender.present? ? 
          (person2.gender.downcase == 'male' ? 'Husband' : 'Wife') : 'Spouse'
        
        # Only mark as "Late" if person2 (spouse) is deceased AND person1 (viewer) is alive
        if should_mark_as_late_spouse?(person2, person1)
          "Late #{base_type}"
        else
          base_type
        end
      end
    when 'child'
      if relationship[:source] == person1.id
        # person1 has child person2, so person2 is the child
        return 'Child' unless person2.gender.present?
        person2.gender.downcase == 'male' ? 'Son' : 'Daughter'
      else
        # person2 has child person1, so person1 is the child
        return 'Child' unless person1.gender.present?
        person1.gender.downcase == 'male' ? 'Son' : 'Daughter'
      end
    when 'parent'
      if relationship[:source] == person1.id
        # person1 has parent person2, so person2 is the parent
        return 'Parent' unless person2.gender.present?
        person2.gender.downcase == 'male' ? 'Father' : 'Mother'
      else
        # person2 has parent person1, so person1 is the parent
        return 'Parent' unless person1.gender.present?
        person1.gender.downcase == 'male' ? 'Father' : 'Mother'
      end
    when 'sibling'
      return 'Sibling' unless person2.gender.present?
      person2.gender.downcase == 'male' ? 'Brother' : 'Sister'
    else
      relationship[:relationship_type].humanize
    end
  end
  
  def classify_relationship_type(relationship_label)
    case relationship_label.downcase
    when /spouse|husband|wife/
      'spouse'
    when /son|daughter|child/
      'child'
    when /father|mother|parent/
      'parent'
    when /brother|sister|sibling/
      'sibling'
    when /grandfather|grandmother|grandparent/
      'grandparent'
    when /grandson|granddaughter|grandchild/
      'grandchild'
    when /uncle|aunt/
      'aunt_uncle'
    when /cousin/
      'cousin'
    when /in-law/
      'in_law'
    else
      'other'
    end
  end

  private

  def should_mark_as_late_spouse?(spouse, person_viewing)
    spouse_deceased = spouse.date_of_death || spouse.is_deceased
    viewer_deceased = person_viewing.date_of_death || person_viewing.is_deceased
    
    # Mark spouse as "late" only if spouse is deceased and viewer is alive
    # Living person sees deceased spouse as "Late Husband/Wife"
    # Deceased person sees living spouse as "Husband/Wife"
    
    spouse_deceased && !viewer_deceased
  end
end