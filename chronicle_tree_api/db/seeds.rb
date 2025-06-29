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
p4 = Person.create!(first_name: 'Vira', last_name: 'Smyshliakova', gender: 'Female', date_of_birth: '1965-01-01', user: user)
p5 = Person.create!(first_name: 'Anatoliy', last_name: 'Smyshliakova', gender: 'Male', date_of_birth: '1963-03-12', date_of_death: '2015-06-10', user: user)

puts "Creating sample relationships..."
Relationship.create!(person: p1, relative: p2, relationship_type: 'spouse')
Relationship.create!(person: p2, relative: p1, relationship_type: 'spouse')
Relationship.create!(person: p1, relative: p3, relationship_type: 'parent')
Relationship.create!(person: p3, relative: p1, relationship_type: 'child')
Relationship.create!(person: p1, relative: p4, relationship_type: 'child')
Relationship.create!(person: p4, relative: p1, relationship_type: 'parent')
Relationship.create!(person: p1, relative: p5, relationship_type: 'child')
Relationship.create!(person: p5, relative: p1, relationship_type: 'parent')

puts "Seed data created successfully!"