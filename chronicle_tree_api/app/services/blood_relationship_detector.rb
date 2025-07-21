# Service to detect blood relationships between people
class BloodRelationshipDetector
  def initialize(person1, person2)
    @person1 = person1
    @person2 = person2
  end

  def self.blood_related?(person1, person2)
    new(person1, person2).blood_related?
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