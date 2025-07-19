require "test_helper"

class RelationshipTest < ActiveSupport::TestCase
  def setup
    @user = User.create!(email: 'test@example.com', password: 'password123', name: 'Test User')
    @john = Person.create!(first_name: 'John', last_name: 'Doe', user: @user, gender: 'Male', is_deceased: false)
    @jane = Person.create!(first_name: 'Jane', last_name: 'Doe', user: @user, gender: 'Female', is_deceased: true)
    @alice = Person.create!(first_name: 'Alice', last_name: 'Smith', user: @user, gender: 'Female', is_deceased: false)
    @david = Person.create!(first_name: 'David', last_name: 'Brown', user: @user, gender: 'Male', is_deceased: false)
  end

  test "can create basic relationship" do
    relationship = Relationship.create!(
      person: @john,
      relative: @jane,
      relationship_type: 'spouse',
      is_ex: false,
      is_deceased: false
    )
    
    assert relationship.valid?
    assert_equal 'spouse', relationship.relationship_type
  end

  test "validates spouse exclusivity" do
    # Create first spouse relationship
    Relationship.create!(
      person: @john,
      relative: @jane,
      relationship_type: 'spouse',
      is_ex: false,
      is_deceased: false
    )
    
    # Try to create second current spouse - should fail
    invalid_relationship = Relationship.new(
      person: @john,
      relative: @alice,
      relationship_type: 'spouse',
      is_ex: false,
      is_deceased: false
    )
    
    assert_not invalid_relationship.valid?
    assert_includes invalid_relationship.errors[:base], "Person can only have one current spouse"
  end

  test "allows ex-spouse relationships" do
    # Create ex-spouse relationship
    relationship = Relationship.create!(
      person: @john,
      relative: @jane,
      relationship_type: 'spouse',
      is_ex: true,
      is_deceased: false
    )
    
    assert relationship.valid?
    
    # Should allow current spouse after ex-spouse
    current_spouse = Relationship.create!(
      person: @john,
      relative: @alice,
      relationship_type: 'spouse',
      is_ex: false,
      is_deceased: false
    )
    
    assert current_spouse.valid?
  end

  test "deceased spouse relationships work correctly" do
    # Create deceased spouse relationship
    relationship = Relationship.create!(
      person: @john,
      relative: @jane,
      relationship_type: 'spouse',
      is_ex: false,
      is_deceased: true
    )
    
    assert relationship.valid?
    assert relationship.is_deceased?
    
    # Should allow current spouse after deceased spouse
    current_spouse = Relationship.create!(
      person: @john,
      relative: @alice,
      relationship_type: 'spouse',
      is_ex: false,
      is_deceased: false
    )
    
    assert current_spouse.valid?
  end

  test "validates spouse cannot be both ex and deceased" do
    relationship = Relationship.new(
      person: @john,
      relative: @jane,
      relationship_type: 'spouse',
      is_ex: true,
      is_deceased: true
    )
    
    assert_not relationship.valid?
    assert_includes relationship.errors[:base], "A spouse cannot be both ex and deceased"
  end

  test "automatically creates reciprocal relationships" do
    relationship = Relationship.create!(
      person: @john,
      relative: @jane,
      relationship_type: 'spouse',
      is_ex: false,
      is_deceased: true
    )
    
    # Check reciprocal relationship was created
    reciprocal = Relationship.find_by(
      person: @jane,
      relative: @john,
      relationship_type: 'spouse'
    )
    
    assert reciprocal.present?
    assert_equal relationship.is_ex, reciprocal.is_ex
    assert_equal relationship.is_deceased, reciprocal.is_deceased
  end

  test "scopes work correctly" do
    # Create various relationship types
    Relationship.create!(person: @john, relative: @jane, relationship_type: 'spouse', is_ex: false, is_deceased: true)
    Relationship.create!(person: @alice, relative: @david, relationship_type: 'spouse', is_ex: true, is_deceased: false)
    
    # Test scopes
    assert_equal 1, Relationship.current_spouses.count
    assert_equal 1, Relationship.ex_spouses.count
    assert_equal 1, Relationship.deceased_spouses.count
  end

  test "creates sibling relationships automatically for parent-child relationships" do
    # Create parent
    parent = Person.create!(first_name: 'Parent', last_name: 'Test', user: @user, gender: 'Female', is_deceased: false)
    
    # Create parent-child relationships
    Relationship.create!(person: parent, relative: @john, relationship_type: 'child')
    Relationship.create!(person: parent, relative: @jane, relationship_type: 'child')
    
    # Check that sibling relationships were created automatically
    sibling_rel = Relationship.find_by(
      person: @john,
      relative: @jane,
      relationship_type: 'sibling'
    )
    
    assert sibling_rel.present?
    
    # Check reciprocal sibling relationship
    reciprocal_sibling = Relationship.find_by(
      person: @jane,
      relative: @john,
      relationship_type: 'sibling'
    )
    
    assert reciprocal_sibling.present?
  end
end
