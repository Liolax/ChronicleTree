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

people_data = {
  'john_doe'    => { first_name: 'John',  last_name: 'Doe',   date_of_birth: '1960-05-10' },
  'jane_doe'    => { first_name: 'Jane',  last_name: 'Smith', date_of_birth: '1962-08-15' },
  'mike_doe'    => { first_name: 'Mike',  last_name: 'Doe',   date_of_birth: '1985-01-20' },
  'sara_doe'    => { first_name: 'Sara',  last_name: 'Doe',   date_of_birth: '1988-11-30' },
  'emily_jones' => { first_name: 'Emily', last_name: 'Jones', date_of_birth: '1986-03-25' },
  'tom_doe'     => { first_name: 'Tom',   last_name: 'Doe',   date_of_birth: '2010-07-12' },
  'lucy_doe'    => { first_name: 'Lucy',  last_name: 'Doe',   date_of_birth: '2012-09-05' }
}

people = {}
people_data.each do |key, data|
  people[key] = Person.create!(data.merge(user: user))
end

def create_relationship(person1, person2, type1, type2)
  Relationship.find_or_create_by!(person: person1, relative: person2, relationship_type: type1.to_s)
  Relationship.find_or_create_by!(person: person2, relative: person1, relationship_type: type2.to_s)
end

create_relationship(people['john_doe'], people['jane_doe'], :spouse, :spouse)
create_relationship(people['john_doe'], people['mike_doe'], :parent, :child)
create_relationship(people['jane_doe'], people['mike_doe'], :parent, :child)
create_relationship(people['john_doe'], people['sara_doe'], :parent, :child)
create_relationship(people['jane_doe'], people['sara_doe'], :parent, :child)
create_relationship(people['mike_doe'], people['sara_doe'], :sibling, :sibling)
create_relationship(people['mike_doe'], people['emily_jones'], :spouse, :spouse)
create_relationship(people['mike_doe'], people['tom_doe'], :parent, :child)
create_relationship(people['emily_jones'], people['tom_doe'], :parent, :child)
create_relationship(people['mike_doe'], people['lucy_doe'], :parent, :child)
create_relationship(people['emily_jones'], people['lucy_doe'], :parent, :child)
create_relationship(people['tom_doe'], people['lucy_doe'], :sibling, :sibling)

puts "Seed data created successfully!"