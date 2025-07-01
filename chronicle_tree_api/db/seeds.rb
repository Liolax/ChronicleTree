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
p1 = Person.find_or_create_by!(id: 1, first_name: 'John', last_name: 'Doe', user: user, gender: 'Male', date_of_birth: Date.new(1980, 1, 1))
p2 = Person.find_or_create_by!(id: 2, first_name: 'Jane', last_name: 'Doe', user: user, gender: 'Female', date_of_birth: Date.new(1982, 2, 2), date_of_death: Date.new(2022, 6, 15))
alice = Person.find_or_create_by!(id: 44, first_name: 'Alice', last_name: 'A', user: user, gender: 'Female', date_of_birth: Date.new(1990, 7, 1))
david = Person.find_or_create_by!(id: 3, first_name: 'David', last_name: 'A', user: user, gender: 'Male', date_of_birth: Date.new(1988, 5, 15))
bob = Person.find_or_create_by!(id: 4, first_name: 'Bob', last_name: 'B', user: user, gender: 'Male', date_of_birth: Date.new(2010, 3, 10))
emily = Person.find_or_create_by!(id: 5, first_name: 'Emily', last_name: 'A', user: user, gender: 'Female', date_of_birth: Date.new(2012, 8, 20))
charlie = Person.find_or_create_by!(id: 6, first_name: 'Charlie', last_name: 'C', user: user, gender: 'Male', date_of_birth: Date.new(2015, 12, 5))

# --- NOTES ---
[p1, p2, alice, david, bob, emily, charlie].each do |person|
  Note.find_or_create_by!(person: person) do |note|
    note.content = "Add a note about this person. You can use this space to record stories, memories, or important details."
  end
end
# --- PROFILES ---
[p1, p2, alice, david, bob, emily, charlie].each do |person|
  Profile.find_or_create_by!(person: person)
end
# Ensure avatars are nil
[p1, p2, alice, david, bob, emily, charlie].each do |person|
  profile = person.profile
  profile.avatar.purge if profile.avatar.attached?
end

# --- FACTS ---
Fact.find_or_create_by!(id: 101, person: p1, label: 'Birthplace', value: 'City A', date: Date.today - 30.years, location: 'City A')
Fact.find_or_create_by!(id: 102, person: p2, label: 'Graduation', value: 'High School', date: Date.today - 12.years, location: 'School B')
Fact.find_or_create_by!(id: 103, person: alice, label: 'Hobby', value: 'Painting', date: Date.today - 5.years, location: 'Studio')
Fact.find_or_create_by!(id: 104, person: david, label: 'Occupation', value: 'Engineer', date: Date.today - 10.years, location: 'Company X')
Fact.find_or_create_by!(id: 105, person: bob, label: 'Favorite Sport', value: 'Soccer', date: Date.today - 2.years, location: 'Field Y')
Fact.find_or_create_by!(id: 106, person: emily, label: 'Favorite Book', value: 'Pride and Prejudice', date: Date.today - 1.year, location: 'Library Z')
Fact.find_or_create_by!(id: 107, person: charlie, label: 'Instrument', value: 'Guitar', date: Date.today - 3.years, location: 'Music School')
# Extra facts for better testing
Fact.find_or_create_by!(id: 108, person: p1, label: 'Military Service', value: 'Army', date: Date.today - 10.years, location: 'Base Q')
Fact.find_or_create_by!(id: 109, person: p2, label: 'First Job', value: 'Teacher', date: Date.today - 8.years, location: 'School C')
Fact.find_or_create_by!(id: 110, person: alice, label: 'Award', value: 'Art Prize', date: Date.today - 2.years, location: 'Gallery')
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
Medium.find_or_create_by!(id: 301, attachable: p1, attachable_type: 'Person', description: 'Profile photo')
Medium.find_or_create_by!(id: 302, attachable: alice, attachable_type: 'Person', description: 'Alice painting')
Medium.find_or_create_by!(id: 303, attachable: p2, attachable_type: 'Person', description: 'Jane graduation photo')
Medium.find_or_create_by!(id: 304, attachable: david, attachable_type: 'Person', description: 'David at work')
# --- RELATIONSHIPS ---
Relationship.find_or_create_by!(id: 401, person: alice, relative: david, relationship_type: 'spouse')
Relationship.find_or_create_by!(id: 402, person: david, relative: alice, relationship_type: 'spouse')
Relationship.find_or_create_by!(id: 403, person: alice, relative: bob, relationship_type: 'parent')
Relationship.find_or_create_by!(id: 404, person: david, relative: bob, relationship_type: 'parent')
Relationship.find_or_create_by!(id: 405, person: alice, relative: emily, relationship_type: 'parent')
Relationship.find_or_create_by!(id: 406, person: david, relative: emily, relationship_type: 'parent')
Relationship.find_or_create_by!(id: 407, person: alice, relative: charlie, relationship_type: 'sibling')
Relationship.find_or_create_by!(id: 408, person: charlie, relative: alice, relationship_type: 'sibling')
Relationship.find_or_create_by!(id: 409, person: p1, relative: p2, relationship_type: 'spouse')
Relationship.find_or_create_by!(id: 410, person: p2, relative: p1, relationship_type: 'spouse')
# Extra relationships for better testing
Relationship.find_or_create_by!(id: 411, person: bob, relative: emily, relationship_type: 'sibling')
Relationship.find_or_create_by!(id: 412, person: emily, relative: bob, relationship_type: 'sibling')

puts 'Fixture-style test people and their data added.'