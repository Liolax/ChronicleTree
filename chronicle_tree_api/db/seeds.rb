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
alice = Person.find_or_create_by!(first_name: 'Alice', last_name: 'Doe', user: user, gender: 'Female', date_of_birth: Date.new(1995,1,1), is_deceased: false)
david = Person.find_or_create_by!(first_name: 'David', last_name: 'Anderson', user: user, gender: 'Male', date_of_birth: Date.new(1993,1,1), is_deceased: false)
bob = Person.find_or_create_by!(first_name: 'Bob', last_name: 'Anderson', user: user, gender: 'Male', date_of_birth: Date.new(2017,1,1), is_deceased: false)
emily = Person.find_or_create_by!(first_name: 'Emily', last_name: 'Anderson', user: user, gender: 'Female', date_of_birth: Date.new(2019,1,1), is_deceased: false)
charlie = Person.find_or_create_by!(first_name: 'Charlie', last_name: 'Doe', user: user, gender: 'Male', date_of_birth: Date.new(1997,1,1), is_deceased: false)

# Additional people to demonstrate deceased spouse functionality
molly = Person.find_or_create_by!(first_name: 'Molly', last_name: 'Doe', user: user, gender: 'Female', date_of_birth: Date.new(1945,3,15), date_of_death: Date.new(2020,11,8), is_deceased: true)
robert = Person.find_or_create_by!(first_name: 'Robert', last_name: 'Doe', user: user, gender: 'Male', date_of_birth: Date.new(1943,7,22), is_deceased: false)
sarah = Person.find_or_create_by!(first_name: 'Sarah', last_name: 'Anderson', user: user, gender: 'Female', date_of_birth: Date.new(1950,9,12), is_deceased: false)
thomas = Person.find_or_create_by!(first_name: 'Thomas', last_name: 'Anderson', user: user, gender: 'Male', date_of_birth: Date.new(1948,12,3), date_of_death: Date.new(2018,5,14), is_deceased: true)

# Additional people for step-brother and cousin relationship testing
lisa = Person.find_or_create_by!(first_name: 'Lisa', last_name: 'Doe', user: user, gender: 'Female', date_of_birth: Date.new(1994,6,10), is_deceased: false)
michael = Person.find_or_create_by!(first_name: 'Michael', last_name: 'Doe', user: user, gender: 'Male', date_of_birth: Date.new(2024,8,15), is_deceased: false)
emma = Person.find_or_create_by!(first_name: 'Emma', last_name: 'Doe', user: user, gender: 'Female', date_of_birth: Date.new(2020,3,22), is_deceased: false)

# Lisa's parents (for step-grandparent relationship testing)
lisa_father = Person.find_or_create_by!(first_name: 'William', last_name: 'O\'Sullivan', user: user, gender: 'Male', date_of_birth: Date.new(1965,4,15), is_deceased: false)
lisa_mother = Person.find_or_create_by!(first_name: 'Patricia', last_name: 'O\'Sullivan', user: user, gender: 'Female', date_of_birth: Date.new(1968,11,8), is_deceased: false)

# --- NOTES ---
[ p1, p2, alice, david, bob, emily, charlie, molly, robert, sarah, thomas, lisa, michael, emma, lisa_father, lisa_mother ].each do |person|
  Note.find_or_create_by!(person: person) do |note|
    note.content = "Add a note about this person. You can use this space to record stories, memories, or important details."
  end
end
# --- PROFILES ---
[ p1, p2, alice, david, bob, emily, charlie, molly, robert, sarah, thomas, lisa, michael, emma, lisa_father, lisa_mother ].each do |person|
  Profile.find_or_create_by!(person: person)
end
# Ensure avatars are nil
[ p1, p2, alice, david, bob, emily, charlie, molly, robert, sarah, thomas, lisa, michael, emma, lisa_father, lisa_mother ].each do |person|
  profile = person.profile
  profile.avatar.purge if profile.avatar.attached?
end

# Attach placeholder profile photos to each person's avatar
profile_photo_urls = {
  p1: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=facearea&w=400&h=400&facepad=2',
  alice: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=facearea&w=400&h=400&facepad=2',
  p2: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&w=400&h=400&facepad=2',
  david: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=facearea&w=400&h=400&facepad=2',
  bob: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?auto=format&fit=facearea&w=400&h=400&facepad=2',
  emily: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=facearea&w=400&h=400&facepad=2',
  charlie: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=400&h=400&facepad=2',
  molly: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=facearea&w=400&h=400&facepad=2',
  robert: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=facearea&w=400&h=400&facepad=2',
  sarah: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=facearea&w=400&h=400&facepad=2',
  thomas: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&w=400&h=400&facepad=2',
  lisa: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&w=400&h=400&facepad=2',
  michael: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?auto=format&fit=facearea&w=400&h=400&facepad=2',
  emma: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=facearea&w=400&h=400&facepad=2',
  lisa_father: 'https://images.unsplash.com/photo-1556474835-b0f3ac40d4d1?auto=format&fit=facearea&w=400&h=400&facepad=2',
  lisa_mother: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=facearea&w=400&h=400&facepad=2'
}
require 'open-uri'
[ p1, alice, p2, david, bob, emily, charlie, molly, robert, sarah, thomas, lisa, michael, emma, lisa_father, lisa_mother ].each do |person|
  profile = person.profile
  url = profile_photo_urls[person == p1 ? :p1 : person == alice ? :alice : person == p2 ? :p2 : person == david ? :david : person == bob ? :bob : person == emily ? :emily : person == charlie ? :charlie : person == molly ? :molly : person == robert ? :robert : person == sarah ? :sarah : person == thomas ? :thomas : person == lisa ? :lisa : person == michael ? :michael : person == emma ? :emma : person == lisa_father ? :lisa_father : :lisa_mother]
  unless profile.avatar.attached?
    begin
      file = URI.open(url)
      profile.avatar.attach(io: file, filename: "avatar_#{person.id}.jpg", content_type: 'image/jpeg')
    rescue OpenURI::HTTPError => e
      puts "Warning: Could not download image for #{person.first_name} from #{url}: #{e.message}"
    end
  end
end

# --- FACTS ---
Fact.find_or_create_by!(id: 101, person: p1, label: 'Occupation', value: 'Software Architect at TechCorp', date: Date.new(2005, 1, 1), location: 'TechCorp HQ')
Fact.find_or_create_by!(id: 102, person: p1, label: 'Military Service', value: 'Served in the Army', date: Date.new(1990, 1, 1), location: 'Base Q')
Fact.find_or_create_by!(id: 103, person: p1, label: 'Residence', value: 'Lives in City B', date: Date.new(2009, 1, 1), location: 'City B')
# Memorial fact is unique and meaningful information not shown in relationships
Fact.find_or_create_by!(id: 120, person: p1, label: 'Memorial', value: 'Dedicated memorial garden for Jane Doe', date: Date.new(2022, 6, 1), location: 'City B Memorial Park')
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
# Facts for new people
Fact.find_or_create_by!(id: 114, person: lisa, label: 'Occupation', value: 'Marketing Manager', date: Date.new(2020, 3, 1), location: 'CreativeWorks Inc')
Fact.find_or_create_by!(id: 115, person: lisa, label: 'Education', value: 'Business Administration Degree', date: Date.new(2016, 5, 15), location: 'State University')
Fact.find_or_create_by!(id: 116, person: michael, label: 'Age', value: '6 months old', date: Date.new(2025, 1, 1), location: 'City B')
Fact.find_or_create_by!(id: 117, person: emma, label: 'Preschool', value: 'Rainbow Preschool', date: Date.new(2023, 9, 1), location: 'City A')
Fact.find_or_create_by!(id: 118, person: lisa_father, label: 'Occupation', value: 'Retired Engineer', date: Date.new(2020, 12, 31), location: 'City C')
Fact.find_or_create_by!(id: 119, person: lisa_mother, label: 'Occupation', value: 'School Principal', date: Date.new(2000, 9, 1), location: 'City C Elementary')
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
# New timeline events for John's later life
TimelineItem.find_or_create_by!(id: 350, person: p1, title: 'Jane Passed Away', date: Date.new(2022,1,1), place: 'City B Hospital', icon: 'Flag', description: 'Beloved wife Jane passed away after a courageous battle with illness.')
TimelineItem.find_or_create_by!(id: 351, person: p1, title: 'Met Lisa', date: Date.new(2022,9,15), place: 'City B Coffee Shop', icon: 'Love', description: 'Met Lisa at a local coffee shop through mutual friends.')
TimelineItem.find_or_create_by!(id: 352, person: p1, title: 'Married Lisa', date: Date.new(2023,6,15), place: 'City B Garden', icon: 'Love', description: 'Married Lisa in a beautiful garden ceremony.')
TimelineItem.find_or_create_by!(id: 353, person: p1, title: 'Michael Born', date: Date.new(2024,8,15), place: 'City B Hospital', icon: 'Birthday', description: 'Son Michael was born.')
TimelineItem.find_or_create_by!(id: 354, person: p1, title: 'Family Reunion', date: Date.new(2024,12,25), place: 'City B', icon: 'Star', description: 'Wonderful Christmas celebration with expanded family including Lisa and Michael.')
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
TimelineItem.find_or_create_by!(id: 220, person: alice, title: 'Married David', date: Date.new(2016,6,1), place: 'City A', icon: 'Love', description: 'Married David Anderson.')
TimelineItem.find_or_create_by!(id: 221, person: alice, title: 'Bob Born', date: Date.new(2017,1,1), place: 'City A', icon: 'Birthday', description: 'Son Bob was born.')
TimelineItem.find_or_create_by!(id: 222, person: alice, title: 'Emily Born', date: Date.new(2019,1,1), place: 'City A', icon: 'Birthday', description: 'Daughter Emily was born.')
TimelineItem.find_or_create_by!(id: 223, person: alice, title: 'Won Art Prize', date: Date.new(2022,11,5), place: 'City Gallery', icon: 'Trophy', description: 'Won Art Prize at City Gallery.')
TimelineItem.find_or_create_by!(id: 224, person: alice, title: 'Divorced David', date: Date.new(2023,1,1), place: 'City A', icon: 'Flag', description: 'Divorced David Anderson.')
TimelineItem.find_or_create_by!(id: 225, person: david, title: 'Born', date: Date.new(1993,1,1), place: 'City A', icon: 'Birthday', description: 'David Anderson was born in City A.')
TimelineItem.find_or_create_by!(id: 226, person: david, title: 'Graduated College', date: Date.new(2015,6,1), place: 'Tech University', icon: 'Graduation', description: 'Graduated from Tech University.')
TimelineItem.find_or_create_by!(id: 227, person: david, title: 'Married Alice', date: Date.new(2016,6,1), place: 'City A', icon: 'Love', description: 'Married Alice Doe.')
TimelineItem.find_or_create_by!(id: 228, person: david, title: 'Bob Born', date: Date.new(2017,1,1), place: 'City A', icon: 'Birthday', description: 'Son Bob was born.')
TimelineItem.find_or_create_by!(id: 229, person: david, title: 'Emily Born', date: Date.new(2019,1,1), place: 'City A', icon: 'Birthday', description: 'Daughter Emily was born.')
TimelineItem.find_or_create_by!(id: 230, person: david, title: 'Started at Company X', date: Date.new(2015,9,1), place: 'Company X HQ', icon: 'Work', description: 'Started as Senior Engineer at Company X.')
TimelineItem.find_or_create_by!(id: 231, person: david, title: 'Divorced Alice', date: Date.new(2023,1,1), place: 'City A', icon: 'Flag', description: 'Divorced Alice Doe.')
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
# Timeline items for new people
TimelineItem.find_or_create_by!(id: 300, person: lisa, title: 'Born', date: Date.new(1994,6,10), place: 'City C', icon: 'Birthday', description: 'Lisa was born in City C.')
TimelineItem.find_or_create_by!(id: 301, person: lisa, title: 'Graduated College', date: Date.new(2016,5,15), place: 'State University', icon: 'Graduation', description: 'Graduated with Business Administration degree.')
TimelineItem.find_or_create_by!(id: 302, person: lisa, title: 'Started at CreativeWorks', date: Date.new(2020,3,1), place: 'CreativeWorks Inc', icon: 'Work', description: 'Started as Marketing Manager.')
TimelineItem.find_or_create_by!(id: 303, person: lisa, title: 'Met John', date: Date.new(2022,9,15), place: 'City B Coffee Shop', icon: 'Love', description: 'Met John Doe at a coffee shop.')
TimelineItem.find_or_create_by!(id: 304, person: lisa, title: 'Married John', date: Date.new(2023,6,15), place: 'City B Garden', icon: 'Love', description: 'Married John Doe.')
TimelineItem.find_or_create_by!(id: 305, person: lisa, title: 'Michael Born', date: Date.new(2024,8,15), place: 'City B Hospital', icon: 'Birthday', description: 'Son Michael was born.')
TimelineItem.find_or_create_by!(id: 310, person: michael, title: 'Born', date: Date.new(2024,8,15), place: 'City B', icon: 'Birthday', description: 'Michael was born in City B.')
TimelineItem.find_or_create_by!(id: 311, person: michael, title: 'First Christmas', date: Date.new(2024,12,25), place: 'City B', icon: 'Star', description: 'First Christmas with the extended family.')
TimelineItem.find_or_create_by!(id: 320, person: emma, title: 'Born', date: Date.new(2020,3,22), place: 'City A', icon: 'Birthday', description: 'Emma was born in City A.')
TimelineItem.find_or_create_by!(id: 321, person: emma, title: 'Started Preschool', date: Date.new(2023,9,1), place: 'Rainbow Preschool', icon: 'Graduation', description: 'Started at Rainbow Preschool.')
TimelineItem.find_or_create_by!(id: 322, person: emma, title: 'First Piano Lesson', date: Date.new(2024,10,1), place: 'Music Studio', icon: 'Star', description: 'Started learning piano like her father Charlie.')
TimelineItem.find_or_create_by!(id: 400, person: lisa_father, title: 'Born', date: Date.new(1965,4,15), place: 'City C', icon: 'Birthday', description: 'William was born in City C.')
TimelineItem.find_or_create_by!(id: 401, person: lisa_father, title: 'Graduated Engineering', date: Date.new(1987,5,15), place: 'State Tech University', icon: 'Graduation', description: 'Graduated with Mechanical Engineering degree.')
TimelineItem.find_or_create_by!(id: 402, person: lisa_father, title: 'Married Patricia', date: Date.new(1990,8,20), place: 'City C Church', icon: 'Love', description: 'Married Patricia O\'Sullivan.')
TimelineItem.find_or_create_by!(id: 403, person: lisa_father, title: 'Lisa Born', date: Date.new(1994,6,10), place: 'City C Hospital', icon: 'Birthday', description: 'Daughter Lisa was born.')
TimelineItem.find_or_create_by!(id: 404, person: lisa_father, title: 'Retired', date: Date.new(2020,12,31), place: 'Engineering Corp', icon: 'Trophy', description: 'Retired after 35 years as a mechanical engineer.')
TimelineItem.find_or_create_by!(id: 410, person: lisa_mother, title: 'Born', date: Date.new(1968,11,8), place: 'City C', icon: 'Birthday', description: 'Patricia was born in City C.')
TimelineItem.find_or_create_by!(id: 411, person: lisa_mother, title: 'Graduated Education', date: Date.new(1990,5,15), place: 'City C University', icon: 'Graduation', description: 'Graduated with Education degree.')
TimelineItem.find_or_create_by!(id: 412, person: lisa_mother, title: 'Married William', date: Date.new(1990,8,20), place: 'City C Church', icon: 'Love', description: 'Married William O\'Sullivan.')
TimelineItem.find_or_create_by!(id: 413, person: lisa_mother, title: 'Started Teaching', date: Date.new(1990,9,1), place: 'City C Elementary', icon: 'Work', description: 'Started teaching at City C Elementary School.')
TimelineItem.find_or_create_by!(id: 414, person: lisa_mother, title: 'Lisa Born', date: Date.new(1994,6,10), place: 'City C Hospital', icon: 'Birthday', description: 'Daughter Lisa was born.')
TimelineItem.find_or_create_by!(id: 415, person: lisa_mother, title: 'Became Principal', date: Date.new(2000,9,1), place: 'City C Elementary', icon: 'Trophy', description: 'Promoted to school principal.')
# --- MEDIA ---
# Images
Medium.find_or_create_by!(id: 301, attachable: p1, attachable_type: 'Person', description: 'Professional portrait of John Doe.', title: 'John Doe Studio Photo')
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
  [ sarah, david ], [ thomas, david ],
  # New relationships for step-brother and cousin testing
  [ p1, michael ], [ lisa, michael ],  # Michael is son of John and Lisa
  [ charlie, emma ],  # Emma is daughter of Charlie (no mother specified yet)
  # Lisa's parents (for step-grandparent testing)
  [ lisa_father, lisa ], [ lisa_mother, lisa ]  # William and Patricia are Lisa's parents
]

# Create parent-child relationships (both directions)
parent_child_pairs.each do |parent, child|
  Relationship.find_or_create_by!(person: parent, relative: child, relationship_type: 'child')
  Relationship.find_or_create_by!(person: child, relative: parent, relationship_type: 'parent')
end

# Spouses (ensure only one current spouse per person, mark deceased spouses appropriately)
Relationship.find_or_create_by!(person: p1, relative: p2, relationship_type: 'spouse', is_ex: false, is_deceased: true)
Relationship.find_or_create_by!(person: p2, relative: p1, relationship_type: 'spouse', is_ex: false, is_deceased: true)
# John's current wife Lisa
Relationship.find_or_create_by!(person: p1, relative: lisa, relationship_type: 'spouse', is_ex: false, is_deceased: false)
Relationship.find_or_create_by!(person: lisa, relative: p1, relationship_type: 'spouse', is_ex: false, is_deceased: false)
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
  [bob, emily], [charlie, alice], [alice, michael], [charlie, michael]
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
puts 'Step-sibling and cousin relationships added:'
puts '  - Lisa (John\'s current wife)'
puts '  - Michael (John & Lisa\'s son, step-brother to Alice & Charlie)'
puts '  - Emma (Charlie\'s daughter, cousin to Bob & Emily)'
puts 'Family tree now includes comprehensive relationship testing including step-families and extended family.'
