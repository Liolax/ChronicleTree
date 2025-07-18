# db/seeds.rb
# This file seeds the database with fixture-style test people for development and testing.

if Rails.env.development?
  puts "Clearing existing data..."
  Relationship.destroy_all
  Person.destroy_all
  User.destroy_all
end

puts "Creating test user..."
user = User.find_or_initialize_by(email: 'test@example.com')
user.name = 'Test User'
user.password = 'Password123!'
user.password_confirmation = 'Password123!'
user.save!

puts "Adding fixture-style test people and their data for UI testing..."
# --- PEOPLE ---
p1 = Person.find_or_create_by!(first_name: 'John', last_name: 'Doe', user: user, gender: 'Male', date_of_birth: Date.new(1980,1,1))
p2 = Person.find_or_create_by!(first_name: 'Jane', last_name: 'Doe', user: user, gender: 'Female', date_of_birth: Date.new(1982,1,1), date_of_death: Date.new(2022,1,1))
alice = Person.find_or_create_by!(first_name: 'Alice', last_name: 'A', user: user, gender: 'Female', date_of_birth: Date.new(1990,1,1))
david = Person.find_or_create_by!(first_name: 'David', last_name: 'A', user: user, gender: 'Male', date_of_birth: Date.new(1988,1,1))
bob = Person.find_or_create_by!(first_name: 'Bob', last_name: 'B', user: user, gender: 'Male', date_of_birth: Date.new(2010,1,1))
emily = Person.find_or_create_by!(first_name: 'Emily', last_name: 'E', user: user, gender: 'Female', date_of_birth: Date.new(2012,1,1))
charlie = Person.find_or_create_by!(first_name: 'Charlie', last_name: 'C', user: user, gender: 'Male', date_of_birth: Date.new(2014,1,1))

# --- NOTES ---
[ p1, p2, alice, david, bob, emily, charlie ].each do |person|
  Note.find_or_create_by!(person: person) do |note|
    note.content = "Add a note about this person. You can use this space to record stories, memories, or important details."
  end
end
# --- PROFILES ---
[ p1, p2, alice, david, bob, emily, charlie ].each do |person|
  Profile.find_or_create_by!(person: person)
end
# Ensure avatars are nil
[ p1, p2, alice, david, bob, emily, charlie ].each do |person|
  profile = person.profile
  profile.avatar.purge if profile.avatar.attached?
end

# --- FACTS ---
Fact.find_or_create_by!(id: 101, person: p1, label: 'Current Occupation', value: 'Software Architect at TechCorp', date: Date.new(2023, 1, 1), location: 'TechCorp HQ')
Fact.find_or_create_by!(id: 102, person: p2, label: 'Current Residence', value: 'Lived in City B', date: Date.new(2021, 6, 1), location: 'City B')
Fact.find_or_create_by!(id: 103, person: alice, label: 'Current Hobby', value: 'Painting landscapes', date: Date.new(2023, 3, 1), location: 'Home Studio')
Fact.find_or_create_by!(id: 104, person: david, label: 'Current Occupation', value: 'Senior Engineer at Company X', date: Date.new(2023, 1, 1), location: 'Company X HQ')
Fact.find_or_create_by!(id: 105, person: bob, label: 'Current School', value: 'Attends Central High School', date: Date.new(2023, 9, 1), location: 'Central High')
Fact.find_or_create_by!(id: 106, person: emily, label: 'Current Hobby', value: 'Reading classic novels', date: Date.new(2023, 2, 14), location: 'Library Z')
Fact.find_or_create_by!(id: 107, person: charlie, label: 'Current Hobby', value: 'Learning guitar', date: Date.new(2023, 9, 1), location: 'Music School')
# Extra facts for better testing
Fact.find_or_create_by!(id: 108, person: p1, label: 'Military Service', value: 'Served in the Army for 2 years', date: Date.new(2002, 7, 1), location: 'Base Q')
Fact.find_or_create_by!(id: 109, person: p2, label: 'Recent Award', value: 'Community Service Award', date: Date.new(2022, 5, 1), location: 'City Hall')
Fact.find_or_create_by!(id: 110, person: alice, label: 'Recent Exhibition', value: 'Art show at City Gallery', date: Date.new(2023, 11, 5), location: 'Gallery')
# --- TIMELINE ITEMS ---
TimelineItem.find_or_create_by!(id: 201, person: p1, title: 'Born', date: Date.today - 30.years, place: 'City A', icon: 'baby')
TimelineItem.find_or_create_by!(id: 202, person: p2, title: 'Graduated', date: Date.today - 12.years, place: 'School B', icon: 'graduation-cap')
TimelineItem.find_or_create_by!(id: 203, person: alice, title: 'Started Painting', date: Date.today - 5.years, place: 'Studio', icon: 'palette')
TimelineItem.find_or_create_by!(id: 204, person: david, title: 'Started Engineering', date: Date.today - 10.years, place: 'Company X', icon: 'briefcase')
TimelineItem.find_or_create_by!(id: 205, person: bob, title: 'Joined Soccer Team', date: Date.today - 2.years, place: 'Field Y', icon: 'soccer-ball')
TimelineItem.find_or_create_by!(id: 206, person: emily, title: 'Read Favorite Book', date: Date.today - 1.year, place: 'Library Z', icon: 'book')
TimelineItem.find_or_create_by!(id: 207, person: charlie, title: 'Learned Guitar', date: Date.today - 3.years, place: 'Music School', icon: 'guitar')
# Extra timeline items for better testing
TimelineItem.find_or_create_by!(id: 208, person: p1, title: 'Married Jane', date: Date.today - 8.years, place: 'City A', icon: 'heart')
TimelineItem.find_or_create_by!(id: 209, person: p2, title: 'Moved to City B', date: Date.today - 7.years, place: 'City B', icon: 'home')
TimelineItem.find_or_create_by!(id: 210, person: alice, title: 'Exhibition', date: Date.today - 1.year, place: 'Gallery', icon: 'star')
# --- MEDIA ---
Medium.find_or_create_by!(id: 301, attachable: p1, attachable_type: 'Person', description: 'Profile photo', title: 'John Doe Profile Photo')
Medium.find_or_create_by!(id: 302, attachable: alice, attachable_type: 'Person', description: 'Alice painting', title: 'Alice Painting')
Medium.find_or_create_by!(id: 303, attachable: p2, attachable_type: 'Person', description: 'Jane graduation photo', title: 'Jane Graduation Photo')
Medium.find_or_create_by!(id: 304, attachable: david, attachable_type: 'Person', description: 'David at work', title: 'David at Work')
# --- RELATIONSHIPS ---
# Define all parent-child pairs in the tree
parent_child_pairs = [
  [ p1, alice ],   [ p2, alice ],
  [ p1, charlie ], [ p2, charlie ],
  [ alice, bob ],  [ david, bob ],
  [ alice, emily ], [ david, emily ]
]

# Create parent-child relationships (both directions)
parent_child_pairs.each do |parent, child|
  Relationship.find_or_create_by!(person: parent, relative: child, relationship_type: 'child')
  Relationship.find_or_create_by!(person: child, relative: parent, relationship_type: 'parent')
end

# Spouses (ensure only one current spouse per person)
Relationship.find_or_create_by!(person: p1, relative: p2, relationship_type: 'spouse', is_ex: false)
Relationship.find_or_create_by!(person: p2, relative: p1, relationship_type: 'spouse', is_ex: false)
Relationship.find_or_create_by!(person: alice, relative: david, relationship_type: 'spouse', is_ex: true)
Relationship.find_or_create_by!(person: david, relative: alice, relationship_type: 'spouse', is_ex: true)

# Siblings (only create sibling relationships for those who share at least one parent)
def shared_parent?(a, b, parent_child_pairs)
  a_parents = parent_child_pairs.select { |pair| pair[1] == a }.map(&:first)
  b_parents = parent_child_pairs.select { |pair| pair[1] == b }.map(&:first)
  (a_parents & b_parents).any?
end

sibling_pairs = [
  [bob, emily], [charlie, alice]
]
sibling_pairs.each do |a, b|
  if shared_parent?(a, b, parent_child_pairs)
    Relationship.find_or_create_by!(person: a, relative: b, relationship_type: 'sibling')
    Relationship.find_or_create_by!(person: b, relative: a, relationship_type: 'sibling')
  end
end

puts 'Fixture-style test people and their data added.'
