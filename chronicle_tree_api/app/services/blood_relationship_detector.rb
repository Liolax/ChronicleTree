# Service to detect blood relationships between people
# ✅ COMPLEX REMARRIAGE SCENARIOS SUPPORTED:
# - Marrying ex-spouse's sibling (if no blood relation)
# - Marrying deceased spouse's relative (if no blood relation)
# ❌ ALWAYS PREVENTED: Any blood relative regardless of previous marriages
class BloodRelationshipDetector
  def initialize(person1, person2)
    @person1 = person1
    @person2 = person2
  end

  def self.blood_related?(person1, person2)
    new(person1, person2).blood_related?
  end
  
  # Check if marriage is allowed considering complex remarriage scenarios
  def self.marriage_allowed?(person1, person2)
    new(person1, person2).marriage_allowed?
  end
  
  # Check if sibling relationship is allowed and logical
  def self.sibling_allowed?(person1, person2)
    new(person1, person2).sibling_allowed?
  end

  def blood_related?
    # Quick checks first
    return false if @person1.nil? || @person2.nil?
    return false if @person1 == @person2

    # Check direct relationships (parent-child)
    return true if direct_parent_child?
    
    # Check sibling relationships
    return true if siblings?
    
    # Check all generational relationships (grandparent, great-grandparent, etc.)
    return true if ancestor_descendant?
    
    # Check uncle/aunt - nephew/niece relationships
    return true if uncle_aunt_nephew_niece?
    
    # Check cousin relationships (first cousins)
    return true if first_cousins?

    false
  end
  
  # Complex remarriage validation - allows specific scenarios while preventing incest
  def marriage_allowed?
    # ALWAYS prevent marriage between blood relatives regardless of previous marriages
    return false if blood_related?
    
    # If not blood related, check if this is an allowed remarriage scenario
    # ✅ Allow: Ex-spouse's sibling (if no blood relation) 
    # ✅ Allow: Deceased spouse's relative (if no blood relation)
    # ✅ Allow: Any non-blood relative
    
    # Check if person2 is a relative of person1's ex or deceased spouse
    allowed_through_ex_spouse = allowed_remarriage_relative?(@person1, @person2) || 
                               allowed_remarriage_relative?(@person2, @person1)
    
    # If it's an allowed remarriage scenario, double-check no blood relationship
    if allowed_through_ex_spouse
      Rails.logger.info "✅ ALLOWED REMARRIAGE: #{@person2.first_name} #{@person2.last_name} is relative of #{@person1.first_name} #{@person1.last_name}'s ex/deceased spouse, with no blood relation"
      return true
    end
    
    # If not blood related and not a remarriage scenario, marriage is allowed
    true
  end
  
  # Enhanced sibling relationship validation
  def sibling_allowed?
    # Quick checks first
    return false if @person1.nil? || @person2.nil?
    return false if @person1 == @person2
    
    # 1. Prevent direct ancestor-descendant relationships from being siblings
    if blood_related?
      # Get the specific relationship
      desc = relationship_description
      return false if desc && (
        desc.include?('parent') || desc.include?('child') ||
        desc.include?('grandparent') || desc.include?('grandchild') ||
        desc.include?('uncle') || desc.include?('aunt') ||
        desc.include?('nephew') || desc.include?('niece') ||
        desc.include?('great-grand')
      )
      
      # Allow existing siblings (they're already siblings)
      return false if siblings?
      
      # Be conservative with cousins - they shouldn't become step-siblings
      return false if first_cousins?
    end
    
    # 2. CRITICAL: Biological siblings must share at least one parent
    # Check if they would share a parent after this relationship is created
    # For now, we'll validate this during the actual relationship creation
    
    # 3. Age validation - siblings should have reasonable age gap
    if @person1.date_of_birth && @person2.date_of_birth
      person1_birth = Date.parse(@person1.date_of_birth.to_s)
      person2_birth = Date.parse(@person2.date_of_birth.to_s)
      age_gap_years = (person1_birth - person2_birth).abs / 365.25
      
      # Siblings should not have more than 25-year age gap
      return false if age_gap_years > 25
    end
    
    # 4. Timeline validation - siblings should have overlapping lifespans or reasonable timing
    if @person1.date_of_birth && @person2.date_of_birth
      person1_birth = Date.parse(@person1.date_of_birth.to_s)
      person2_birth = Date.parse(@person2.date_of_birth.to_s)
      
      # Check if one died before the other was born
      if @person1.date_of_death
        person1_death = Date.parse(@person1.date_of_death.to_s)
        return false if person2_birth > person1_death
      end
      
      if @person2.date_of_death
        person2_death = Date.parse(@person2.date_of_death.to_s)
        return false if person1_birth > person2_death
      end
    end
    
    # 5. Prevent existing parent-child relationships from becoming siblings
    return false if @person1.children.include?(@person2)
    return false if @person2.children.include?(@person1)
    
    true
  end

  def relationship_description
    return nil unless blood_related?

    # Direct relationships
    if @person1.children.include?(@person2)
      return "#{@person2.first_name} is #{@person1.first_name}'s child"
    elsif @person2.children.include?(@person1)
      return "#{@person1.first_name} is #{@person2.first_name}'s child"
    end

    # Sibling relationships
    if siblings?
      return "#{@person1.first_name} and #{@person2.first_name} are siblings"
    end

    # Multi-generational relationships
    if ancestor_descendant?
      # Determine the specific generational relationship
      if grandparent_grandchild?
        if @person1.children.any? { |child| child.children.include?(@person2) }
          return "#{@person2.first_name} is #{@person1.first_name}'s grandchild"
        else
          return "#{@person1.first_name} is #{@person2.first_name}'s grandchild"
        end
      elsif great_grandparent_great_grandchild?
        if @person1.children.any? { |child| child.children.any? { |grandchild| grandchild.children.include?(@person2) } }
          return "#{@person2.first_name} is #{@person1.first_name}'s great-grandchild"
        else
          return "#{@person1.first_name} is #{@person2.first_name}'s great-grandchild"
        end
      else
        # For deeper relationships, use generic ancestor/descendant
        if is_ancestor_of?(@person1, @person2)
          return "#{@person2.first_name} is #{@person1.first_name}'s descendant"
        else
          return "#{@person1.first_name} is #{@person2.first_name}'s descendant"
        end
      end
    end

    # Uncle/aunt - nephew/niece
    if uncle_aunt_nephew_niece?
      return "#{@person1.first_name} and #{@person2.first_name} are uncle/aunt and nephew/niece"
    end

    # First cousins
    if first_cousins?
      return "#{@person1.first_name} and #{@person2.first_name} are first cousins"
    end

    "#{@person1.first_name} and #{@person2.first_name} are blood relatives"
  end

  private
  
  # Check if candidate is a relative of person's ex or deceased spouse
  def allowed_remarriage_relative?(person, candidate)
    return false unless person.spouses.any?
    
    # Get all ex-spouses and deceased spouses
    ex_and_deceased_spouses = person.spouses.select do |spouse|
      relationship = person.relationships.find { |rel| rel.relative_id == spouse.id && rel.relationship_type == 'spouse' }
      relationship&.is_ex || spouse.date_of_death.present?
    end
    
    return false if ex_and_deceased_spouses.empty?
    
    # Check if candidate is a relative of any ex or deceased spouse
    ex_and_deceased_spouses.each do |spouse|
      # Check if candidate is a relative (parent, child, sibling) of this spouse
      if spouse.parents.include?(candidate) || 
         spouse.children.include?(candidate) || 
         spouse.siblings.include?(candidate)
        
        # Ensure candidate is not blood related to person (already checked in marriage_allowed? but double-check)
        return true unless BloodRelationshipDetector.blood_related?(person, candidate)
      end
    end
    
    false
  end

  def direct_parent_child?
    @person1.children.include?(@person2) || @person2.children.include?(@person1)
  end

  def siblings?
    # Share at least one parent
    person1_parents = @person1.parents.pluck(:id)
    person2_parents = @person2.parents.pluck(:id)
    
    return false if person1_parents.empty? || person2_parents.empty?
    
    (person1_parents & person2_parents).any?
  end

  def grandparent_grandchild?
    # Check if person1 is grandparent of person2 or vice versa
    @person1.children.any? { |child| child.children.include?(@person2) } ||
    @person2.children.any? { |child| child.children.include?(@person1) }
  end

  def great_grandparent_great_grandchild?
    # Check if person1 is great-grandparent of person2 or vice versa (3 generations)
    @person1.children.any? { |child| child.children.any? { |grandchild| grandchild.children.include?(@person2) } } ||
    @person2.children.any? { |child| child.children.any? { |grandchild| grandchild.children.include?(@person1) } }
  end

  def ancestor_descendant?
    # Check if one person is an ancestor of another (any number of generations)
    is_ancestor_of?(@person1, @person2) || is_ancestor_of?(@person2, @person1)
  end

  def is_ancestor_of?(ancestor, descendant, visited = Set.new, max_depth = 10)
    return false if max_depth <= 0
    return false if visited.include?(ancestor.id)
    return false if ancestor == descendant
    
    visited.add(ancestor.id)
    
    # Check direct children
    ancestor.children.each do |child|
      return true if child == descendant
      return true if is_ancestor_of?(child, descendant, visited.dup, max_depth - 1)
    end
    
    false
  end

  def uncle_aunt_nephew_niece?
    # Person1 is uncle/aunt to person2 if person1's sibling is person2's parent
    person1_siblings = @person1.siblings
    person2_parents = @person2.parents
    
    return true if (person1_siblings & person2_parents).any?

    # Person2 is uncle/aunt to person1 if person2's sibling is person1's parent
    person2_siblings = @person2.siblings
    person1_parents = @person1.parents
    
    (person2_siblings & person1_parents).any?
  end

  def first_cousins?
    # First cousins share grandparents (their parents are siblings)
    person1_parents = @person1.parents
    person2_parents = @person2.parents
    
    person1_parents.any? do |p1_parent|
      person2_parents.any? do |p2_parent|
        p1_parent != p2_parent && siblings_of?(p1_parent, p2_parent)
      end
    end
  end

  def siblings_of?(person1, person2)
    # Check if two people are siblings
    person1_parents = person1.parents.pluck(:id)
    person2_parents = person2.parents.pluck(:id)
    
    return false if person1_parents.empty? || person2_parents.empty?
    
    (person1_parents & person2_parents).any?
  end
end