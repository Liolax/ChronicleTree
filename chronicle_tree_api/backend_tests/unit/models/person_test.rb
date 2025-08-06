require "test_helper"

# Person model unit tests
# Tests spouse tracking, in-law relationships, and deceased status handling
class PersonTest < ActiveSupport::TestCase
  def setup
    @user = User.create!(email: 'test@example.com', password: 'password123', name: 'Test User')
    @john = Person.create!(first_name: 'John', last_name: 'Doe', user: @user, gender: 'Male', is_deceased: false)
    @jane = Person.create!(first_name: 'Jane', last_name: 'Smith', user: @user, gender: 'Female', is_deceased: true, date_of_death: '2022-01-01')
    @lisa = Person.create!(first_name: 'Lisa', last_name: 'Johnson', user: @user, gender: 'Female', is_deceased: false)
    @richard = Person.create!(first_name: 'Richard', last_name: 'Smith', user: @user, gender: 'Male', is_deceased: false)
    @margaret = Person.create!(first_name: 'Margaret', last_name: 'Smith', user: @user, gender: 'Female', is_deceased: false)
    @william = Person.create!(first_name: 'William', last_name: 'Johnson', user: @user, gender: 'Male', is_deceased: false)
    @patricia = Person.create!(first_name: 'Patricia', last_name: 'Johnson', user: @user, gender: 'Female', is_deceased: false)
  end

  test "current_spouses excludes deceased spouses" do
    # John has deceased spouse Jane and living spouse Lisa
    Relationship.create!(person: @john, relative: @jane, relationship_type: 'spouse', is_ex: false, is_deceased: true)
    Relationship.create!(person: @jane, relative: @john, relationship_type: 'spouse', is_ex: false, is_deceased: true)
    
    Relationship.create!(person: @john, relative: @lisa, relationship_type: 'spouse', is_ex: false, is_deceased: false)
    Relationship.create!(person: @lisa, relative: @john, relationship_type: 'spouse', is_ex: false, is_deceased: false)
    
    current_spouses = @john.current_spouses
    assert_equal 1, current_spouses.count
    assert_includes current_spouses, @lisa
    assert_not_includes current_spouses, @jane
  end

  test "current_spouses excludes ex-spouses even if alive" do
    # John divorced from Jane and currently married to Lisa
    Relationship.create!(person: @john, relative: @jane, relationship_type: 'spouse', is_ex: true, is_deceased: false)
    Relationship.create!(person: @jane, relative: @john, relationship_type: 'spouse', is_ex: true, is_deceased: false)
    
    Relationship.create!(person: @john, relative: @lisa, relationship_type: 'spouse', is_ex: false, is_deceased: false)
    Relationship.create!(person: @lisa, relative: @john, relationship_type: 'spouse', is_ex: false, is_deceased: false)
    
    current_spouses = @john.current_spouses
    assert_equal 1, current_spouses.count
    assert_includes current_spouses, @lisa
    assert_not_includes current_spouses, @jane
  end

  test "current_spouses excludes ex-spouses who died later" do
    # John's ex-spouse Jane died after their divorce
    # Configure Jane as initially alive to simulate post-divorce death
    @jane.update!(is_deceased: false, date_of_death: nil)
    
    Relationship.create!(person: @john, relative: @jane, relationship_type: 'spouse', is_ex: true, is_deceased: false)
    Relationship.create!(person: @jane, relative: @john, relationship_type: 'spouse', is_ex: true, is_deceased: false)
    
    # Update Jane's death date to reflect post-divorce mortality
    @jane.update!(date_of_death: '2023-06-01')
    
    Relationship.create!(person: @john, relative: @lisa, relationship_type: 'spouse', is_ex: false, is_deceased: false)
    Relationship.create!(person: @lisa, relative: @john, relationship_type: 'spouse', is_ex: false, is_deceased: false)
    
    current_spouses = @john.current_spouses
    assert_equal 1, current_spouses.count
    assert_includes current_spouses, @lisa
    assert_not_includes current_spouses, @jane
  end

  test "parents_in_law only includes current spouses parents" do
    # Set up family tree with parent-child relationships for in-law testing
    Relationship.create!(person: @jane, relative: @richard, relationship_type: 'parent')
    Relationship.create!(person: @richard, relative: @jane, relationship_type: 'child')
    Relationship.create!(person: @jane, relative: @margaret, relationship_type: 'parent')
    Relationship.create!(person: @margaret, relative: @jane, relationship_type: 'child')
    
    Relationship.create!(person: @lisa, relative: @william, relationship_type: 'parent')
    Relationship.create!(person: @william, relative: @lisa, relationship_type: 'child')
    Relationship.create!(person: @lisa, relative: @patricia, relationship_type: 'parent')
    Relationship.create!(person: @patricia, relative: @lisa, relationship_type: 'child')
    
    # John has deceased spouse Jane and living spouse Lisa
    Relationship.create!(person: @john, relative: @jane, relationship_type: 'spouse', is_ex: false, is_deceased: true)
    Relationship.create!(person: @jane, relative: @john, relationship_type: 'spouse', is_ex: false, is_deceased: true)
    
    Relationship.create!(person: @john, relative: @lisa, relationship_type: 'spouse', is_ex: false, is_deceased: false)
    Relationship.create!(person: @lisa, relative: @john, relationship_type: 'spouse', is_ex: false, is_deceased: false)
    
    parents_in_law = @john.parents_in_law
    
    # In-law relationships exclude deceased spouse's parents
    assert_includes parents_in_law, @william
    assert_includes parents_in_law, @patricia
    assert_not_includes parents_in_law, @richard
    assert_not_includes parents_in_law, @margaret
  end

  test "parents_in_law excludes ex-spouse parents" do
    # Set up family tree with parent-child relationships for in-law testing
    Relationship.create!(person: @jane, relative: @richard, relationship_type: 'parent')
    Relationship.create!(person: @richard, relative: @jane, relationship_type: 'child')
    Relationship.create!(person: @jane, relative: @margaret, relationship_type: 'parent')
    Relationship.create!(person: @margaret, relative: @jane, relationship_type: 'child')
    
    Relationship.create!(person: @lisa, relative: @william, relationship_type: 'parent')
    Relationship.create!(person: @william, relative: @lisa, relationship_type: 'child')
    Relationship.create!(person: @lisa, relative: @patricia, relationship_type: 'parent')
    Relationship.create!(person: @patricia, relative: @lisa, relationship_type: 'child')
    
    # John's ex-spouse is alive but divorced, current spouse is Lisa
    @jane.update!(is_deceased: false, date_of_death: nil) # Jane is living but no longer married to John
    
    Relationship.create!(person: @john, relative: @jane, relationship_type: 'spouse', is_ex: true, is_deceased: false)
    Relationship.create!(person: @jane, relative: @john, relationship_type: 'spouse', is_ex: true, is_deceased: false)
    
    Relationship.create!(person: @john, relative: @lisa, relationship_type: 'spouse', is_ex: false, is_deceased: false)
    Relationship.create!(person: @lisa, relative: @john, relationship_type: 'spouse', is_ex: false, is_deceased: false)
    
    parents_in_law = @john.parents_in_law
    
    # In-law relationships exclude ex-spouse's parents regardless of life status
    assert_includes parents_in_law, @william
    assert_includes parents_in_law, @patricia
    assert_not_includes parents_in_law, @richard
    assert_not_includes parents_in_law, @margaret
  end
end
