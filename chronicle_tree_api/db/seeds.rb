# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
#
# --- Cleanup ---
if Rails.env.development?
  puts "Cleaning up old development data..."
  Relationship.destroy_all
  Person.destroy_all
  User.destroy_all
end

# --- User ---
puts "Creating default development user..."
user = User.find_or_create_by!(email: 'test@example.com') do |u|
  u.name = 'Test User'
  u.password = 'Password123!'
  u.password_confirmation = 'Password123!'
end
puts "Default user created! Email: #{user.email}, Password: Password123!"

# --- People ---
puts "Creating sample family tree..."
people_data = {
  'john_doe' => { first_name: 'John', last_name: 'Doe', date_of_birth: '1960-05-10' },
  'jane_doe' => { first_name: 'Jane', last_name: 'Smith', date_of_birth: '1962-08-15' },
  'mike_doe' => { first_name: 'Mike', last_name: 'Doe', date_of_birth: '1985-01-20' },
  'sara_doe' => { first_name: 'Sara', last_name: 'Doe', date_of_birth: '1988-11-30' },
  'emily_jones' => { first_name: 'Emily', last_name: 'Jones', date_of_birth: '1986-03-25' },
  'tom_doe' => { first_name: 'Tom', last_name: 'Doe', date_of_birth: '2010-07-12' },
  'lucy_doe' => { first_name: 'Lucy', last_name: 'Doe', date_of_birth: '2012-09-05' }
}

people = {}
people_data.each do |key, data|
  people[key] = Person.create!(data.merge(user: user))
end
puts "#{Person.count} people created."

# --- Relationships ---
# Helper to create a two-way relationship
def create_relationship(person1, person2, type1, type2)
  Relationship.find_or_create_by!(person: person1, relative: person2, relationship_type: type1.to_s)
  Relationship.find_or_create_by!(person: person2, relative: person1, relationship_type: type2.to_s)
end

puts "Creating relationships..."
# John and Jane are spouses
create_relationship(people['john_doe'], people['jane_doe'], :spouse, :spouse)

# John and Jane are parents to Mike and Sara
create_relationship(people['john_doe'], people['mike_doe'], :parent, :child)
create_relationship(people['jane_doe'], people['mike_doe'], :parent, :child)
create_relationship(people['john_doe'], people['sara_doe'], :parent, :child)
create_relationship(people['jane_doe'], people['sara_doe'], :parent, :child)

# Mike and Sara are siblings
create_relationship(people['mike_doe'], people['sara_doe'], :sibling, :sibling)

# Mike and Emily are spouses
create_relationship(people['mike_doe'], people['emily_jones'], :spouse, :spouse)

# Mike and Emily are parents to Tom and Lucy
create_relationship(people['mike_doe'], people['tom_doe'], :parent, :child)
create_relationship(people['emily_jones'], people['tom_doe'], :parent, :child)
create_relationship(people['mike_doe'], people['lucy_doe'], :parent, :child)
create_relationship(people['emily_jones'], people['lucy_doe'], :parent, :child)

# Tom and Lucy are siblings
create_relationship(people['tom_doe'], people['lucy_doe'], :sibling, :sibling)

puts "#{Relationship.count} relationships created."
puts "Seed data created successfully!"
