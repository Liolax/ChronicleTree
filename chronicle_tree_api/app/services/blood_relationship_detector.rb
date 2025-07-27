# Project service: detects blood relationships to prevent consanguineous marriages
# Implements genealogical algorithms for family tree validation
class BloodRelationshipDetector
  def initialize(person1, person2)
    @person1 = person1
    @person2 = person2
  end

  def self.blood_related?(person1, person2)
    new(person1, person2).blood_related?
  end
  
  def self.marriage_allowed?(person1, person2)
    new(person1, person2).marriage_allowed?
  end
  
  def self.sibling_allowed?(person1, person2)
    new(person1, person2).sibling_allowed?
  end

  def blood_related?
    return false if @person1.nil? || @person2.nil?
    return false if @person1 == @person2

    return true if direct_parent_child?
    return true if siblings?
    return true if ancestor_descendant?
    return true if uncle_aunt_nephew_niece?
    return true if first_cousins?

    false
  end
  
  def marriage_allowed?
    return false if blood_related?
    
    allowed_through_ex_spouse = allowed_remarriage_relative?(@person1, @person2) || 
                               allowed_remarriage_relative?(@person2, @person1)
    
    return true if allowed_through_ex_spouse
    
    true
  end
  
  def sibling_allowed?
    return false if @person1.nil? || @person2.nil?
    return false if @person1 == @person2
    
    if blood_related?
      desc = relationship_description
      return false if desc && (
        desc.include?('parent') || desc.include?('child') ||
        desc.include?('grandparent') || desc.include?('grandchild') ||
        desc.include?('uncle') || desc.include?('aunt') ||
        desc.include?('nephew') || desc.include?('niece') ||
        desc.include?('great-grand')
      )
      
      return false if siblings?
      return false if first_cousins?
    end
    
    if @person1.date_of_birth && @person2.date_of_birth
      person1_birth = Date.parse(@person1.date_of_birth.to_s)
      person2_birth = Date.parse(@person2.date_of_birth.to_s)
      age_gap_years = (person1_birth - person2_birth).abs / 365.25
      
      return false if age_gap_years > 25
    end
    
    if @person1.date_of_birth && @person2.date_of_birth
      person1_birth = Date.parse(@person1.date_of_birth.to_s)
      person2_birth = Date.parse(@person2.date_of_birth.to_s)
      
      if @person1.date_of_death
        person1_death = Date.parse(@person1.date_of_death.to_s)
        return false if person2_birth > person1_death
      end
      
      if @person2.date_of_death
        person2_death = Date.parse(@person2.date_of_death.to_s)
        return false if person1_birth > person2_death
      end
    end
    
    return false if @person1.children.include?(@person2)
    return false if @person2.children.include?(@person1)
    
    true
  end

  def relationship_description
    return nil unless blood_related?

    if @person1.children.include?(@person2)
      return "#{@person2.first_name} is #{@person1.first_name}'s child"
    elsif @person2.children.include?(@person1)
      return "#{@person1.first_name} is #{@person2.first_name}'s child"
    end

    if siblings?
      return "#{@person1.first_name} and #{@person2.first_name} are siblings"
    end

    if ancestor_descendant?
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
        if is_ancestor_of?(@person1, @person2)
          return "#{@person2.first_name} is #{@person1.first_name}'s descendant"
        else
          return "#{@person1.first_name} is #{@person2.first_name}'s descendant"
        end
      end
    end

    if uncle_aunt_nephew_niece?
      return "#{@person1.first_name} and #{@person2.first_name} are uncle/aunt and nephew/niece"
    end

    if first_cousins?
      return "#{@person1.first_name} and #{@person2.first_name} are first cousins"
    end

    "#{@person1.first_name} and #{@person2.first_name} are blood relatives"
  end

  private
  
  def allowed_remarriage_relative?(person, candidate)
    return false unless person.spouses.any?
    
    ex_and_deceased_spouses = person.spouses.select do |spouse|
      relationship = person.relationships.find { |rel| rel.relative_id == spouse.id && rel.relationship_type == 'spouse' }
      relationship&.is_ex || spouse.date_of_death.present?
    end
    
    return false if ex_and_deceased_spouses.empty?
    
    ex_and_deceased_spouses.each do |spouse|
      if spouse.parents.include?(candidate) || 
         spouse.children.include?(candidate) || 
         spouse.siblings.include?(candidate)
        
        return true unless BloodRelationshipDetector.blood_related?(person, candidate)
      end
    end
    
    false
  end

  def direct_parent_child?
    @person1.children.include?(@person2) || @person2.children.include?(@person1)
  end

  def siblings?
    person1_parents = @person1.parents.pluck(:id)
    person2_parents = @person2.parents.pluck(:id)
    
    return false if person1_parents.empty? || person2_parents.empty?
    
    (person1_parents & person2_parents).any?
  end

  def grandparent_grandchild?
    @person1.children.any? { |child| child.children.include?(@person2) } ||
    @person2.children.any? { |child| child.children.include?(@person1) }
  end

  def great_grandparent_great_grandchild?
    @person1.children.any? { |child| child.children.any? { |grandchild| grandchild.children.include?(@person2) } } ||
    @person2.children.any? { |child| child.children.any? { |grandchild| grandchild.children.include?(@person1) } }
  end

  def ancestor_descendant?
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
    person1_siblings = @person1.siblings
    person2_parents = @person2.parents
    
    return true if (person1_siblings & person2_parents).any?

    person2_siblings = @person2.siblings
    person1_parents = @person1.parents
    
    (person2_siblings & person1_parents).any?
  end

  def first_cousins?
    person1_parents = @person1.parents
    person2_parents = @person2.parents
    
    person1_parents.any? do |p1_parent|
      person2_parents.any? do |p2_parent|
        p1_parent != p2_parent && siblings_of?(p1_parent, p2_parent)
      end
    end
  end

  def siblings_of?(person1, person2)
    person1_parents = person1.parents.pluck(:id)
    person2_parents = person2.parents.pluck(:id)
    
    return false if person1_parents.empty? || person2_parents.empty?
    
    (person1_parents & person2_parents).any?
  end
end