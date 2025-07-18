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
p1 = Person.find_or_create_by!(first_name: 'John', last_name: 'Doe', user: user, gender: 'Male', date_of_birth: Date.new(1970,1,1))
p2 = Person.find_or_create_by!(first_name: 'Jane', last_name: 'Doe', user: user, gender: 'Female', date_of_birth: Date.new(1972,1,1), date_of_death: Date.new(2022,1,1))
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
Fact.find_or_create_by!(id: 101, person: p1, label: 'Occupation', value: 'Software Architect at TechCorp', date: Date.new(2005, 1, 1), location: 'TechCorp HQ')
Fact.find_or_create_by!(id: 102, person: p1, label: 'Military Service', value: 'Served in the Army', date: Date.new(1990, 1, 1), location: 'Base Q')
Fact.find_or_create_by!(id: 103, person: p1, label: 'Residence', value: 'Lives in City B', date: Date.new(2009, 1, 1), location: 'City B')
Fact.find_or_create_by!(id: 104, person: p2, label: 'Occupation', value: 'Teacher at School B', date: Date.new(1995, 1, 1), location: 'School B')
Fact.find_or_create_by!(id: 105, person: p2, label: 'Residence', value: 'Moved to City B', date: Date.new(2010, 1, 1), location: 'City B')
Fact.find_or_create_by!(id: 106, person: alice, label: 'Hobby', value: 'Painting landscapes', date: Date.new(2005, 1, 1), location: 'Home Studio')
 # Removed Award from facts; will be timeline event
Fact.find_or_create_by!(id: 108, person: david, label: 'Occupation', value: 'Senior Engineer at Company X', date: Date.new(2010, 1, 1), location: 'Company X HQ')
Fact.find_or_create_by!(id: 109, person: david, label: 'Hobby', value: 'Cycling', date: Date.new(2005, 1, 1), location: 'City Park')
Fact.find_or_create_by!(id: 110, person: bob, label: 'School', value: 'Central High School', date: Date.new(2020, 9, 1), location: 'Central High')
 # Removed Sports Achievement from facts; will be timeline event
Fact.find_or_create_by!(id: 112, person: emily, label: 'Hobby', value: 'Reading classic novels', date: Date.new(2020, 2, 14), location: 'Library Z')
Fact.find_or_create_by!(id: 113, person: charlie, label: 'Hobby', value: 'Learning guitar', date: Date.new(2020, 9, 1), location: 'Music School')
# --- TIMELINE ITEMS ---
TimelineItem.find_or_create_by!(id: 241, person: alice, title: 'Won Art Prize', date: Date.new(2018,11,5), place: 'City Gallery', icon: 'Trophy', description: 'Won Art Prize at City Gallery.')
TimelineItem.find_or_create_by!(id: 242, person: bob, title: 'Became Team Captain', date: Date.new(2024,4,10), place: 'Field Y', icon: 'Trophy', description: 'Became soccer team captain.')
TimelineItem.find_or_create_by!(id: 201, person: p1, title: 'Born', date: Date.new(1970,1,1), place: 'City A', icon: 'Birthday', description: 'John was born in City A.')
TimelineItem.find_or_create_by!(id: 202, person: p1, title: 'Graduated High School', date: Date.new(1988,6,1), place: 'City A High', icon: 'Graduation', description: 'Graduated from City A High School.')
TimelineItem.find_or_create_by!(id: 203, person: p1, title: 'Military Service', date: Date.new(1990,1,1), place: 'Base Q', icon: 'Flag', description: 'Served in the Army for 2 years.')
TimelineItem.find_or_create_by!(id: 204, person: p1, title: 'Married Jane', date: Date.new(1995,6,1), place: 'City A', icon: 'Love', description: 'Married Jane in City A.')
TimelineItem.find_or_create_by!(id: 205, person: p1, title: 'Alice Born', date: Date.new(1996,1,1), place: 'City A', icon: 'Birthday', description: 'Daughter Alice was born.')
TimelineItem.find_or_create_by!(id: 206, person: p1, title: 'Charlie Born', date: Date.new(2000,1,1), place: 'City A', icon: 'Birthday', description: 'Son Charlie was born.')
TimelineItem.find_or_create_by!(id: 207, person: p1, title: 'Started at TechCorp', date: Date.new(2005,1,1), place: 'TechCorp HQ', icon: 'Work', description: 'Started as Software Architect at TechCorp.')
TimelineItem.find_or_create_by!(id: 208, person: p1, title: 'Moved to City B', date: Date.new(2009,1,1), place: 'City B', icon: 'Home', description: 'Moved to City B for work.')
TimelineItem.find_or_create_by!(id: 209, person: p2, title: 'Born', date: Date.new(1972,1,1), place: 'City B', icon: 'Birthday', description: 'Jane was born in City B.')
TimelineItem.find_or_create_by!(id: 210, person: p2, title: 'Graduated College', date: Date.new(1992,6,1), place: 'School B', icon: 'Graduation', description: 'Graduated from School B.')
TimelineItem.find_or_create_by!(id: 211, person: p2, title: 'Married John', date: Date.new(1995,6,1), place: 'City A', icon: 'Love', description: 'Married John in City A.')
TimelineItem.find_or_create_by!(id: 212, person: p2, title: 'Alice Born', date: Date.new(1996,1,1), place: 'City A', icon: 'Birthday', description: 'Daughter Alice was born.')
TimelineItem.find_or_create_by!(id: 213, person: p2, title: 'Charlie Born', date: Date.new(2000,1,1), place: 'City A', icon: 'Birthday', description: 'Son Charlie was born.')
TimelineItem.find_or_create_by!(id: 214, person: p2, title: 'Started Teaching', date: Date.new(1995,1,1), place: 'School B', icon: 'Work', description: 'Started teaching at School B.')
TimelineItem.find_or_create_by!(id: 215, person: p2, title: 'Moved to City B', date: Date.new(2010,1,1), place: 'City B', icon: 'Home', description: 'Moved to City B.')
TimelineItem.find_or_create_by!(id: 216, person: alice, title: 'Born', date: Date.new(1990,1,1), place: 'City A', icon: 'Birthday', description: 'Alice was born in City A.')
TimelineItem.find_or_create_by!(id: 217, person: alice, title: 'Graduated High School', date: Date.new(2014,6,1), place: 'City A High', icon: 'Graduation', description: 'Graduated from City A High School.')
TimelineItem.find_or_create_by!(id: 218, person: alice, title: 'Started Painting', date: Date.new(2015,1,1), place: 'Home Studio', icon: 'Star', description: 'Began painting landscapes.')
TimelineItem.find_or_create_by!(id: 219, person: alice, title: 'Married David', date: Date.new(2016,6,1), place: 'City A', icon: 'Love', description: 'Married David.')
TimelineItem.find_or_create_by!(id: 220, person: alice, title: 'Bob Born', date: Date.new(2017,1,1), place: 'City A', icon: 'Birthday', description: 'Son Bob was born.')
TimelineItem.find_or_create_by!(id: 221, person: alice, title: 'Emily Born', date: Date.new(2019,1,1), place: 'City A', icon: 'Birthday', description: 'Daughter Emily was born.')
TimelineItem.find_or_create_by!(id: 222, person: alice, title: 'Won Art Prize', date: Date.new(2022,11,5), place: 'City Gallery', icon: 'Trophy', description: 'Won Art Prize at City Gallery.')
TimelineItem.find_or_create_by!(id: 223, person: alice, title: 'Divorced David', date: Date.new(2023,1,1), place: 'City A', icon: 'Flag', description: 'Divorced David.')
TimelineItem.find_or_create_by!(id: 224, person: david, title: 'Born', date: Date.new(1990,1,1), place: 'City A', icon: 'Birthday', description: 'David was born in City A.')
TimelineItem.find_or_create_by!(id: 225, person: david, title: 'Graduated College', date: Date.new(2012,6,1), place: 'Tech University', icon: 'Graduation', description: 'Graduated from Tech University.')
TimelineItem.find_or_create_by!(id: 226, person: david, title: 'Married Alice', date: Date.new(2016,6,1), place: 'City A', icon: 'Love', description: 'Married Alice.')
TimelineItem.find_or_create_by!(id: 227, person: david, title: 'Bob Born', date: Date.new(2017,1,1), place: 'City A', icon: 'Birthday', description: 'Son Bob was born.')
TimelineItem.find_or_create_by!(id: 228, person: david, title: 'Emily Born', date: Date.new(2019,1,1), place: 'City A', icon: 'Birthday', description: 'Daughter Emily was born.')
TimelineItem.find_or_create_by!(id: 229, person: david, title: 'Started at Company X', date: Date.new(2010,1,1), place: 'Company X HQ', icon: 'Work', description: 'Started as Senior Engineer at Company X.')
TimelineItem.find_or_create_by!(id: 230, person: david, title: 'Divorced Alice', date: Date.new(2023,1,1), place: 'City A', icon: 'Flag', description: 'Divorced Alice.')
TimelineItem.find_or_create_by!(id: 231, person: bob, title: 'Born', date: Date.new(2010,1,1), place: 'City A', icon: 'Birthday', description: 'Bob was born in City A.')
TimelineItem.find_or_create_by!(id: 232, person: bob, title: 'Started School', date: Date.new(2023,9,1), place: 'Central Elementary', icon: 'Graduation', description: 'Started at Central Elementary School.')
TimelineItem.find_or_create_by!(id: 233, person: bob, title: 'Joined Soccer Team', date: Date.new(2024,4,10), place: 'Field Y', icon: 'Star', description: 'Joined the city soccer team.')
TimelineItem.find_or_create_by!(id: 234, person: bob, title: 'Became Team Captain', date: Date.new(2024,4,10), place: 'Field Y', icon: 'Trophy', description: 'Became soccer team captain.')
TimelineItem.find_or_create_by!(id: 235, person: emily, title: 'Born', date: Date.new(2012,1,1), place: 'City A', icon: 'Birthday', description: 'Emily was born in City A.')
TimelineItem.find_or_create_by!(id: 236, person: emily, title: 'Started School', date: Date.new(2023,9,1), place: 'Central Elementary', icon: 'Graduation', description: 'Started at Central Elementary School.')
TimelineItem.find_or_create_by!(id: 237, person: emily, title: 'Read Favorite Book', date: Date.new(2024,2,14), place: 'Library Z', icon: 'Star', description: 'Read "Pride and Prejudice" for the first time.')
TimelineItem.find_or_create_by!(id: 238, person: charlie, title: 'Born', date: Date.new(2014,1,1), place: 'City A', icon: 'Birthday', description: 'Charlie was born in City A.')
TimelineItem.find_or_create_by!(id: 239, person: charlie, title: 'Started School', date: Date.new(2023,9,1), place: 'Central Elementary', icon: 'Graduation', description: 'Started at Central Elementary School.')
TimelineItem.find_or_create_by!(id: 240, person: charlie, title: 'Learned Guitar', date: Date.new(2024,9,1), place: 'Music School', icon: 'Star', description: 'Started learning guitar.')
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
