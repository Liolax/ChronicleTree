require "test_helper"

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
    # John married to Jane (deceased) and Lisa (alive)
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
    # John divorced from Jane (alive) and married to Lisa (alive)
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
    # John divorced from Jane, then Jane died later (ex-spouse + deceased)
    # Make Jane alive first, then set date_of_death to simulate dying after divorce
    @jane.update!(is_deceased: false, date_of_death: nil)
    
    Relationship.create!(person: @john, relative: @jane, relationship_type: 'spouse', is_ex: true, is_deceased: false)
    Relationship.create!(person: @jane, relative: @john, relationship_type: 'spouse', is_ex: true, is_deceased: false)
    
    # Now Jane dies after divorce
    @jane.update!(date_of_death: '2023-06-01')
    
    Relationship.create!(person: @john, relative: @lisa, relationship_type: 'spouse', is_ex: false, is_deceased: false)
    Relationship.create!(person: @lisa, relative: @john, relationship_type: 'spouse', is_ex: false, is_deceased: false)
    
    current_spouses = @john.current_spouses
    assert_equal 1, current_spouses.count
    assert_includes current_spouses, @lisa
    assert_not_includes current_spouses, @jane
  end

  test "parents_in_law only includes current spouses parents" do
    # Setup parent relationships
    Relationship.create!(person: @jane, relative: @richard, relationship_type: 'parent')
    Relationship.create!(person: @richard, relative: @jane, relationship_type: 'child')
    Relationship.create!(person: @jane, relative: @margaret, relationship_type: 'parent')
    Relationship.create!(person: @margaret, relative: @jane, relationship_type: 'child')
    
    Relationship.create!(person: @lisa, relative: @william, relationship_type: 'parent')
    Relationship.create!(person: @william, relative: @lisa, relationship_type: 'child')
    Relationship.create!(person: @lisa, relative: @patricia, relationship_type: 'parent')
    Relationship.create!(person: @patricia, relative: @lisa, relationship_type: 'child')
    
    # John married to Jane (deceased) and Lisa (alive)
    Relationship.create!(person: @john, relative: @jane, relationship_type: 'spouse', is_ex: false, is_deceased: true)
    Relationship.create!(person: @jane, relative: @john, relationship_type: 'spouse', is_ex: false, is_deceased: true)
    
    Relationship.create!(person: @john, relative: @lisa, relationship_type: 'spouse', is_ex: false, is_deceased: false)
    Relationship.create!(person: @lisa, relative: @john, relationship_type: 'spouse', is_ex: false, is_deceased: false)
    
    parents_in_law = @john.parents_in_law
    
    # Should only include Lisa's parents (living spouse), not Jane's parents (deceased spouse)
    assert_includes parents_in_law, @william
    assert_includes parents_in_law, @patricia
    assert_not_includes parents_in_law, @richard
    assert_not_includes parents_in_law, @margaret
  end

  test "parents_in_law excludes ex-spouse parents" do
    # Setup parent relationships
    Relationship.create!(person: @jane, relative: @richard, relationship_type: 'parent')
    Relationship.create!(person: @richard, relative: @jane, relationship_type: 'child')
    Relationship.create!(person: @jane, relative: @margaret, relationship_type: 'parent')
    Relationship.create!(person: @margaret, relative: @jane, relationship_type: 'child')
    
    Relationship.create!(person: @lisa, relative: @william, relationship_type: 'parent')
    Relationship.create!(person: @william, relative: @lisa, relationship_type: 'child')
    Relationship.create!(person: @lisa, relative: @patricia, relationship_type: 'parent')
    Relationship.create!(person: @patricia, relative: @lisa, relationship_type: 'child')
    
    # John divorced from Jane (ex-spouse) and married to Lisa (current spouse)
    @jane.update!(is_deceased: false, date_of_death: nil) # Jane is alive but divorced
    
    Relationship.create!(person: @john, relative: @jane, relationship_type: 'spouse', is_ex: true, is_deceased: false)
    Relationship.create!(person: @jane, relative: @john, relationship_type: 'spouse', is_ex: true, is_deceased: false)
    
    Relationship.create!(person: @john, relative: @lisa, relationship_type: 'spouse', is_ex: false, is_deceased: false)
    Relationship.create!(person: @lisa, relative: @john, relationship_type: 'spouse', is_ex: false, is_deceased: false)
    
    parents_in_law = @john.parents_in_law
    
    # Should only include Lisa's parents (current spouse), not Jane's parents (ex-spouse)
    assert_includes parents_in_law, @william
    assert_includes parents_in_law, @patricia
    assert_not_includes parents_in_law, @richard
    assert_not_includes parents_in_law, @margaret
  end
end
