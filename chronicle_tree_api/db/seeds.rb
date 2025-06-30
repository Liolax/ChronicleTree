# db/seeds.rb
# This file seeds the database with sample data for development and testing.

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

puts "Creating sample people..."
p1 = Person.create!(first_name: 'Yuliia', last_name: 'Smyshliakova', gender: 'Female', date_of_birth: '1990-05-15', user: user)
p2 = Person.create!(first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1988-08-20', user: user)
p3 = Person.create!(first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '2020-01-10', user: user)
p4 = Person.create!(first_name: 'Anna', last_name: 'Doe', gender: 'Female', date_of_birth: '2018-03-12', user: user)
grandpa = Person.create!(first_name: 'Robert', last_name: 'Doe', gender: 'Male', date_of_birth: '1950-02-01', user: user)
grandma = Person.create!(first_name: 'Linda', last_name: 'Doe', gender: 'Female', date_of_birth: '1952-09-15', user: user)
aunt = Person.create!(first_name: 'Susan', last_name: 'Smith', gender: 'Female', date_of_birth: '1975-11-30', user: user)
cousin1 = Person.create!(first_name: 'Emily', last_name: 'Smith', gender: 'Female', date_of_birth: '2000-04-05', user: user)
sibling = Person.create!(first_name: 'Olga', last_name: 'Smyshliakova', gender: 'Female', date_of_birth: '1992-10-10', user: user)

puts "Creating sample relationships..."
# Helper for bidirectional relationships
# Renamed from 'dup' to avoid conflict with Ruby's built-in 'dup' method

def create_bidirectional_relationship(a, b, type1, type2)
  Relationship.create!(person_id: a.id, relative_id: b.id, relationship_type: type1)
  Relationship.create!(person_id: b.id, relative_id: a.id, relationship_type: type2)
end
# Spouse
create_bidirectional_relationship(p1, p2, 'spouse', 'spouse')
# Children
create_bidirectional_relationship(p1, p3, 'parent', 'child')
create_bidirectional_relationship(p2, p3, 'parent', 'child')
create_bidirectional_relationship(p1, p4, 'parent', 'child')
create_bidirectional_relationship(p2, p4, 'parent', 'child')
# Sibling
create_bidirectional_relationship(p3, p4, 'sibling', 'sibling')
# Grandparent
create_bidirectional_relationship(grandpa, p2, 'parent', 'child')
create_bidirectional_relationship(grandma, p2, 'parent', 'child')
create_bidirectional_relationship(grandpa, aunt, 'parent', 'child')
create_bidirectional_relationship(grandma, aunt, 'parent', 'child')
# Aunt/Uncle to cousin
create_bidirectional_relationship(aunt, cousin1, 'parent', 'child')
# Cousin
create_bidirectional_relationship(p3, cousin1, 'cousin', 'cousin')
# Sibling for p1
create_bidirectional_relationship(p1, sibling, 'sibling', 'sibling')

puts "Seed data created successfully!"