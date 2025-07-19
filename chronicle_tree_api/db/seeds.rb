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
p1 = Person.find_or_create_by!(first_name: 'John', last_name: 'Doe', user: user, gender: 'Male', date_of_birth: Date.new(1970,1,1), is_deceased: false)
p2 = Person.find_or_create_by!(first_name: 'Jane', last_name: 'Doe', user: user, gender: 'Female', date_of_birth: Date.new(1972,1,1), date_of_death: Date.new(2022,1,1), is_deceased: true)
alice = Person.find_or_create_by!(first_name: 'Alice', last_name: 'A', user: user, gender: 'Female', date_of_birth: Date.new(1995,1,1), is_deceased: false)
david = Person.find_or_create_by!(first_name: 'David', last_name: 'A', user: user, gender: 'Male', date_of_birth: Date.new(1993,1,1), is_deceased: false)
bob = Person.find_or_create_by!(first_name: 'Bob', last_name: 'B', user: user, gender: 'Male', date_of_birth: Date.new(2017,1,1), is_deceased: false)
emily = Person.find_or_create_by!(first_name: 'Emily', last_name: 'E', user: user, gender: 'Female', date_of_birth: Date.new(2019,1,1), is_deceased: false)
charlie = Person.find_or_create_by!(first_name: 'Charlie', last_name: 'C', user: user, gender: 'Male', date_of_birth: Date.new(1997,1,1), is_deceased: false)

# Additional people to demonstrate deceased spouse functionality
molly = Person.find_or_create_by!(first_name: 'Molly', last_name: 'Johnson', user: user, gender: 'Female', date_of_birth: Date.new(1945,3,15), date_of_death: Date.new(2020,11,8), is_deceased: true)
robert = Person.find_or_create_by!(first_name: 'Robert', last_name: 'Johnson', user: user, gender: 'Male', date_of_birth: Date.new(1943,7,22), is_deceased: false)
sarah = Person.find_or_create_by!(first_name: 'Sarah', last_name: 'Williams', user: user, gender: 'Female', date_of_birth: Date.new(1950,9,12), is_deceased: false)
thomas = Person.find_or_create_by!(first_name: 'Thomas', last_name: 'Williams', user: user, gender: 'Male', date_of_birth: Date.new(1948,12,3), date_of_death: Date.new(2018,5,14), is_deceased: true)

# --- NOTES ---
[ p1, p2, alice, david, bob, emily, charlie, molly, robert, sarah, thomas ].each do |person|
  Note.find_or_create_by!(person: person) do |note|
    note.content = "Add a note about this person. You can use this space to record stories, memories, or important details."
  end
end
# --- PROFILES ---
[ p1, p2, alice, david, bob, emily, charlie, molly, robert, sarah, thomas ].each do |person|
  Profile.find_or_create_by!(person: person)
end
# Ensure avatars are nil
[ p1, p2, alice, david, bob, emily, charlie, molly, robert, sarah, thomas ].each do |person|
  profile = person.profile
  profile.avatar.purge if profile.avatar.attached?
end

# Attach placeholder profile photos to each person's avatar
profile_photo_urls = {
  p1: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400&facepad=2',
  alice: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=400&h=400&facepad=2',
  p2: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2',
  david: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=facearea&w=400&h=400&facepad=2',
  bob: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=facearea&w=400&h=400&facepad=2',
  emily: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=400&h=400&facepad=2',
  charlie: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=facearea&w=400&h=400&facepad=2',
  molly: 'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=facearea&w=400&h=400&facepad=2',
  robert: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=400&h=400&facepad=2',
  sarah: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=400&h=400&facepad=2',
  thomas: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&w=400&h=400&facepad=2'
}
require 'open-uri'
[ p1, alice, p2, david, bob, emily, charlie, molly, robert, sarah, thomas ].each do |person|
  profile = person.profile
  url = profile_photo_urls[person == p1 ? :p1 : person == alice ? :alice : person == p2 ? :p2 : person == david ? :david : person == bob ? :bob : person == emily ? :emily : person == charlie ? :charlie : person == molly ? :molly : person == robert ? :robert : person == sarah ? :sarah : :thomas]
  unless profile.avatar.attached?
    file = URI.open(url)
    profile.avatar.attach(io: file, filename: "avatar_#{person.id}.jpg", content_type: 'image/jpeg')
  end
end

# --- FACTS ---
Fact.find_or_create_by!(id: 101, person: p1, label: 'Occupation', value: 'Software Architect at TechCorp', date: Date.new(2005, 1, 1), location: 'TechCorp HQ')
Fact.find_or_create_by!(id: 102, person: p1, label: 'Military Service', value: 'Served in the Army', date: Date.new(1990, 1, 1), location: 'Base Q')
Fact.find_or_create_by!(id: 103, person: p1, label: 'Residence', value: 'Lives in City B', date: Date.new(2009, 1, 1), location: 'City B')
Fact.find_or_create_by!(id: 104, person: p2, label: 'Occupation', value: 'Teacher at School B', date: Date.new(1995, 1, 1), location: 'School B')
Fact.find_or_create_by!(id: 105, person: p2, label: 'Residence', value: 'Moved to City B', date: Date.new(2010, 1, 1), location: 'City B')
Fact.find_or_create_by!(id: 106, person: alice, label: 'Hobby', value: 'Painting landscapes', date: Date.new(2005, 1, 1), location: 'Home Studio')
 # Removed Award from facts; will be timeline event
Fact.find_or_create_by!(id: 108, person: david, label: 'Occupation', value: 'Senior Engineer at Company X', date: Date.new(2015, 9, 1), location: 'Company X HQ')
Fact.find_or_create_by!(id: 109, person: david, label: 'Hobby', value: 'Cycling', date: Date.new(2010, 1, 1), location: 'City Park')
Fact.find_or_create_by!(id: 110, person: bob, label: 'School', value: 'Central Elementary School', date: Date.new(2023, 9, 1), location: 'City A')
 # Removed Sports Achievement from facts; will be timeline event
Fact.find_or_create_by!(id: 112, person: emily, label: 'Hobby', value: 'Playing with toys', date: Date.new(2024, 2, 14), location: 'Home')
Fact.find_or_create_by!(id: 113, person: charlie, label: 'Education', value: 'Music College Student', date: Date.new(2015, 9, 1), location: 'Music College')
# --- TIMELINE ITEMS ---
TimelineItem.find_or_create_by!(id: 242, person: alice, title: 'Won Art Prize', date: Date.new(2018,11,5), place: 'City Gallery', icon: 'Trophy', description: 'Won Art Prize at City Gallery.')
TimelineItem.find_or_create_by!(id: 243, person: bob, title: 'Became Team Captain', date: Date.new(2024,4,10), place: 'Field Y', icon: 'Trophy', description: 'Became soccer team captain.')
TimelineItem.find_or_create_by!(id: 201, person: p1, title: 'Born', date: Date.new(1970,1,1), place: 'City A', icon: 'Birthday', description: 'John was born in City A.')
TimelineItem.find_or_create_by!(id: 202, person: p1, title: 'Graduated High School', date: Date.new(1988,6,1), place: 'City A High', icon: 'Graduation', description: 'Graduated from City A High School.')
TimelineItem.find_or_create_by!(id: 203, person: p1, title: 'Military Service', date: Date.new(1990,1,1), place: 'Base Q', icon: 'Flag', description: 'Served in the Army for 2 years.')
TimelineItem.find_or_create_by!(id: 204, person: p1, title: 'Graduated College', date: Date.new(1994,6,1), place: 'Tech University', icon: 'Graduation', description: 'Graduated with Computer Science degree.')
TimelineItem.find_or_create_by!(id: 205, person: p1, title: 'Married Jane', date: Date.new(1994,8,1), place: 'City A', icon: 'Love', description: 'Married Jane in City A.')
TimelineItem.find_or_create_by!(id: 206, person: p1, title: 'Alice Born', date: Date.new(1995,1,1), place: 'City A', icon: 'Birthday', description: 'Daughter Alice was born.')
TimelineItem.find_or_create_by!(id: 207, person: p1, title: 'Charlie Born', date: Date.new(1997,1,1), place: 'City A', icon: 'Birthday', description: 'Son Charlie was born.')
TimelineItem.find_or_create_by!(id: 208, person: p1, title: 'Started at TechCorp', date: Date.new(2005,1,1), place: 'TechCorp HQ', icon: 'Work', description: 'Promoted to Software Architect at TechCorp.')
TimelineItem.find_or_create_by!(id: 209, person: p1, title: 'Moved to City B', date: Date.new(2009,1,1), place: 'City B', icon: 'Home', description: 'Moved to City B for work.')
TimelineItem.find_or_create_by!(id: 210, person: p2, title: 'Born', date: Date.new(1972,1,1), place: 'City B', icon: 'Birthday', description: 'Jane was born in City B.')
TimelineItem.find_or_create_by!(id: 211, person: p2, title: 'Graduated College', date: Date.new(1994,5,1), place: 'Education University', icon: 'Graduation', description: 'Graduated with Education degree.')
TimelineItem.find_or_create_by!(id: 212, person: p2, title: 'Married John', date: Date.new(1994,8,1), place: 'City A', icon: 'Love', description: 'Married John in City A.')
TimelineItem.find_or_create_by!(id: 213, person: p2, title: 'Alice Born', date: Date.new(1995,1,1), place: 'City A', icon: 'Birthday', description: 'Daughter Alice was born.')
TimelineItem.find_or_create_by!(id: 214, person: p2, title: 'Started Teaching', date: Date.new(1995,9,1), place: 'School B', icon: 'Work', description: 'Started teaching at School B.')
TimelineItem.find_or_create_by!(id: 215, person: p2, title: 'Charlie Born', date: Date.new(1997,1,1), place: 'City A', icon: 'Birthday', description: 'Son Charlie was born.')
TimelineItem.find_or_create_by!(id: 216, person: p2, title: 'Moved to City B', date: Date.new(2010,1,1), place: 'City B', icon: 'Home', description: 'Moved to City B with family.')
TimelineItem.find_or_create_by!(id: 217, person: alice, title: 'Born', date: Date.new(1995,1,1), place: 'City A', icon: 'Birthday', description: 'Alice was born in City A.')
TimelineItem.find_or_create_by!(id: 218, person: alice, title: 'Graduated High School', date: Date.new(2013,6,1), place: 'City A High', icon: 'Graduation', description: 'Graduated from City A High School.')
TimelineItem.find_or_create_by!(id: 219, person: alice, title: 'Started Painting', date: Date.new(2014,1,1), place: 'Home Studio', icon: 'Star', description: 'Began painting landscapes.')
TimelineItem.find_or_create_by!(id: 220, person: alice, title: 'Married David', date: Date.new(2016,6,1), place: 'City A', icon: 'Love', description: 'Married David.')
TimelineItem.find_or_create_by!(id: 221, person: alice, title: 'Bob Born', date: Date.new(2017,1,1), place: 'City A', icon: 'Birthday', description: 'Son Bob was born.')
TimelineItem.find_or_create_by!(id: 222, person: alice, title: 'Emily Born', date: Date.new(2019,1,1), place: 'City A', icon: 'Birthday', description: 'Daughter Emily was born.')
TimelineItem.find_or_create_by!(id: 223, person: alice, title: 'Won Art Prize', date: Date.new(2022,11,5), place: 'City Gallery', icon: 'Trophy', description: 'Won Art Prize at City Gallery.')
TimelineItem.find_or_create_by!(id: 224, person: alice, title: 'Divorced David', date: Date.new(2023,1,1), place: 'City A', icon: 'Flag', description: 'Divorced David.')
TimelineItem.find_or_create_by!(id: 225, person: david, title: 'Born', date: Date.new(1993,1,1), place: 'City A', icon: 'Birthday', description: 'David was born in City A.')
TimelineItem.find_or_create_by!(id: 226, person: david, title: 'Graduated College', date: Date.new(2015,6,1), place: 'Tech University', icon: 'Graduation', description: 'Graduated from Tech University.')
TimelineItem.find_or_create_by!(id: 227, person: david, title: 'Married Alice', date: Date.new(2016,6,1), place: 'City A', icon: 'Love', description: 'Married Alice.')
TimelineItem.find_or_create_by!(id: 228, person: david, title: 'Bob Born', date: Date.new(2017,1,1), place: 'City A', icon: 'Birthday', description: 'Son Bob was born.')
TimelineItem.find_or_create_by!(id: 229, person: david, title: 'Emily Born', date: Date.new(2019,1,1), place: 'City A', icon: 'Birthday', description: 'Daughter Emily was born.')
TimelineItem.find_or_create_by!(id: 230, person: david, title: 'Started at Company X', date: Date.new(2015,9,1), place: 'Company X HQ', icon: 'Work', description: 'Started as Senior Engineer at Company X.')
TimelineItem.find_or_create_by!(id: 231, person: david, title: 'Divorced Alice', date: Date.new(2023,1,1), place: 'City A', icon: 'Flag', description: 'Divorced Alice.')
TimelineItem.find_or_create_by!(id: 232, person: bob, title: 'Born', date: Date.new(2017,1,1), place: 'City A', icon: 'Birthday', description: 'Bob was born in City A.')
TimelineItem.find_or_create_by!(id: 233, person: bob, title: 'Started School', date: Date.new(2023,9,1), place: 'City A', icon: 'Graduation', description: 'Started at Central Elementary School.')
TimelineItem.find_or_create_by!(id: 234, person: bob, title: 'Joined Soccer Team', date: Date.new(2024,4,10), place: 'Field Y', icon: 'Star', description: 'Joined the city soccer team.')
TimelineItem.find_or_create_by!(id: 235, person: bob, title: 'Became Team Captain', date: Date.new(2024,4,10), place: 'Field Y', icon: 'Trophy', description: 'Became soccer team captain.')
TimelineItem.find_or_create_by!(id: 236, person: emily, title: 'Born', date: Date.new(2019,1,1), place: 'City A', icon: 'Birthday', description: 'Emily was born in City A.')
TimelineItem.find_or_create_by!(id: 237, person: emily, title: 'Started Preschool', date: Date.new(2024,9,1), place: 'City A', icon: 'Graduation', description: 'Started at Little Stars Preschool.')
TimelineItem.find_or_create_by!(id: 238, person: emily, title: 'Favorite Toy', date: Date.new(2024,2,14), place: 'Home', icon: 'Star', description: 'Got her favorite teddy bear for her 5th birthday.')
TimelineItem.find_or_create_by!(id: 239, person: charlie, title: 'Born', date: Date.new(1997,1,1), place: 'City A', icon: 'Birthday', description: 'Charlie was born in City A.')
TimelineItem.find_or_create_by!(id: 240, person: charlie, title: 'Graduated High School', date: Date.new(2015,6,1), place: 'City A High', icon: 'Graduation', description: 'Graduated from City A High School.')
TimelineItem.find_or_create_by!(id: 241, person: charlie, title: 'Started College', date: Date.new(2015,9,1), place: 'Music College', icon: 'Graduation', description: 'Started studying music at college.')
# --- MEDIA ---
# Images
Medium.find_or_create_by!(id: 301, attachable: p1, attachable_type: 'Person', description: 'Professional portrait of John Doe, used for his profile.', title: 'John Doe Profile Photo')
Medium.find_or_create_by!(id: 302, attachable: alice, attachable_type: 'Person', description: 'Alice painting a landscape in her studio.', title: 'Alice Painting')
Medium.find_or_create_by!(id: 303, attachable: p2, attachable_type: 'Person', description: 'Jane Doe at her graduation ceremony.', title: 'Jane Graduation Photo')
Medium.find_or_create_by!(id: 304, attachable: david, attachable_type: 'Person', description: 'David working as a senior engineer at Company X.', title: 'David at Work')
Medium.find_or_create_by!(id: 305, attachable: bob, attachable_type: 'Person', description: 'Bob playing soccer on the city team.', title: 'Bob Soccer Action')
Medium.find_or_create_by!(id: 306, attachable: emily, attachable_type: 'Person', description: 'Emily reading her favorite novel at the library.', title: 'Emily Reading')
Medium.find_or_create_by!(id: 307, attachable: charlie, attachable_type: 'Person', description: 'Charlie performing at the school music event.', title: 'Charlie Guitar Performance')
# PDFs
Medium.find_or_create_by!(id: 308, attachable: p1, attachable_type: 'Person', description: 'John Doe Resume PDF for professional reference.', title: 'John Doe Resume')
Medium.find_or_create_by!(id: 309, attachable: alice, attachable_type: 'Person', description: 'Alice Art Portfolio PDF, showcasing her best works.', title: 'Alice Art Portfolio')
# Attach placeholder images to media records if not already attached
require 'open-uri'

# Attach files to media records
require 'open-uri'
media_files = [
  # Images
  {id: 301, url: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400&facepad=2', filename: 'john_doe.jpg', content_type: 'image/jpeg'},
  {id: 302, url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=400&h=400&facepad=2', filename: 'alice_painting.jpg', content_type: 'image/jpeg'},
  {id: 303, url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2', filename: 'jane_graduation.jpg', content_type: 'image/jpeg'},
  {id: 304, url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=facearea&w=400&h=400&facepad=2', filename: 'david_work.jpg', content_type: 'image/jpeg'},
  {id: 305, url: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=facearea&w=400&h=400&facepad=2', filename: 'bob_soccer.jpg', content_type: 'image/jpeg'},
  {id: 306, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=400&h=400&facepad=2', filename: 'emily_reading.jpg', content_type: 'image/jpeg'},
  {id: 307, url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=facearea&w=400&h=400&facepad=2', filename: 'charlie_guitar.jpg', content_type: 'image/jpeg'},
  # PDFs
  {id: 308, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', filename: 'john_doe_resume.pdf', content_type: 'application/pdf'},
  {id: 309, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', filename: 'alice_portfolio.pdf', content_type: 'application/pdf'}
]
media_files.each do |file_info|
  media = Medium.find_by(id: file_info[:id])
  next unless media
  unless media.file.attached?
    file = URI.open(file_info[:url])
    media.file.attach(io: file, filename: file_info[:filename], content_type: file_info[:content_type])
  end
end
# --- RELATIONSHIPS ---
# Define all parent-child pairs in the tree
parent_child_pairs = [
  [ p1, alice ],   [ p2, alice ],
  [ p1, charlie ], [ p2, charlie ],
  [ alice, bob ],  [ david, bob ],
  [ alice, emily ], [ david, emily ],
  # Molly and Robert are John's parents (making them Alice and Charlie's grandparents)
  [ molly, p1 ], [ robert, p1 ],
  # Sarah is David's mother, Thomas was David's father (deceased)
  [ sarah, david ], [ thomas, david ]
]

# Create parent-child relationships (both directions)
parent_child_pairs.each do |parent, child|
  Relationship.find_or_create_by!(person: parent, relative: child, relationship_type: 'child')
  Relationship.find_or_create_by!(person: child, relative: parent, relationship_type: 'parent')
end

# Spouses (ensure only one current spouse per person, mark deceased spouses appropriately)
Relationship.find_or_create_by!(person: p1, relative: p2, relationship_type: 'spouse', is_ex: false, is_deceased: true)
Relationship.find_or_create_by!(person: p2, relative: p1, relationship_type: 'spouse', is_ex: false, is_deceased: true)
Relationship.find_or_create_by!(person: alice, relative: david, relationship_type: 'spouse', is_ex: true, is_deceased: false)
Relationship.find_or_create_by!(person: david, relative: alice, relationship_type: 'spouse', is_ex: true, is_deceased: false)
# Molly and Robert were married (Molly is deceased)
Relationship.find_or_create_by!(person: molly, relative: robert, relationship_type: 'spouse', is_ex: false, is_deceased: true)
Relationship.find_or_create_by!(person: robert, relative: molly, relationship_type: 'spouse', is_ex: false, is_deceased: true)
# Sarah and Thomas were married (Thomas is deceased)
Relationship.find_or_create_by!(person: sarah, relative: thomas, relationship_type: 'spouse', is_ex: false, is_deceased: true)
Relationship.find_or_create_by!(person: thomas, relative: sarah, relationship_type: 'spouse', is_ex: false, is_deceased: true)

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
puts 'Deceased spouse relationships included:'
puts '  - Jane (deceased spouse of John)'
puts '  - Molly (deceased spouse of Robert)'
puts '  - Thomas (deceased spouse of Sarah)'
puts 'Family tree now includes grandparents and in-laws for comprehensive relationship testing.'
