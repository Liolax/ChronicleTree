# db/seeds.rb
# This file seeds the database with a realistic, multi-generation family tree for development and testing.

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

puts "Creating people..."
# Generation 1 (Great-grandparents)
ggfather1 = Person.create!(first_name: 'Edward', last_name: 'Smith', gender: 'Male', date_of_birth: '1920-01-01', user: user)
ggmother1 = Person.create!(first_name: 'Margaret', last_name: 'Smith', gender: 'Female', date_of_birth: '1922-03-15', user: user)
ggfather2 = Person.create!(first_name: 'George', last_name: 'Brown', gender: 'Male', date_of_birth: '1921-06-10', user: user)
ggmother2 = Person.create!(first_name: 'Helen', last_name: 'Brown', gender: 'Female', date_of_birth: '1923-09-20', user: user)

# Generation 2 (Grandparents)
gfather1 = Person.create!(first_name: 'William', last_name: 'Smith', gender: 'Male', date_of_birth: '1945-05-10', user: user)
gmother1 = Person.create!(first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '1947-07-22', user: user)
gfather2 = Person.create!(first_name: 'Charles', last_name: 'Brown', gender: 'Male', date_of_birth: '1946-11-30', user: user)
gmother2 = Person.create!(first_name: 'Barbara', last_name: 'Brown', gender: 'Female', date_of_birth: '1948-02-14', user: user)

# Generation 3 (Parents, aunts/uncles)
father = Person.create!(first_name: 'John', last_name: 'Smith', gender: 'Male', date_of_birth: '1970-08-20', user: user)
mother = Person.create!(first_name: 'Linda', last_name: 'Brown', gender: 'Female', date_of_birth: '1972-05-15', user: user)
aunt1 = Person.create!(first_name: 'Susan', last_name: 'Smith', gender: 'Female', date_of_birth: '1973-11-30', user: user)
uncle1 = Person.create!(first_name: 'James', last_name: 'Brown', gender: 'Male', date_of_birth: '1971-04-18', user: user)

# Generation 4 (Children, cousins)
child1 = Person.create!(first_name: 'Emily', last_name: 'Smith', gender: 'Female', date_of_birth: '2000-01-10', user: user)
child2 = Person.create!(first_name: 'Michael', last_name: 'Smith', gender: 'Male', date_of_birth: '2002-03-12', user: user)
cousin1 = Person.create!(first_name: 'Jessica', last_name: 'Brown', gender: 'Female', date_of_birth: '2001-07-25', user: user)
cousin2 = Person.create!(first_name: 'David', last_name: 'Brown', gender: 'Male', date_of_birth: '2003-09-30', user: user)

puts "Creating relationships..."
def create_bidirectional_relationship(a, b, type1, type2)
  Relationship.create!(person_id: a.id, relative_id: b.id, relationship_type: type1)
  Relationship.create!(person_id: b.id, relative_id: a.id, relationship_type: type2)
end
# Great-grandparents married
create_bidirectional_relationship(ggfather1, ggmother1, 'spouse', 'spouse')
create_bidirectional_relationship(ggfather2, ggmother2, 'spouse', 'spouse')
# Great-grandparents' children (grandparents)
create_bidirectional_relationship(ggfather1, gfather1, 'parent', 'child')
create_bidirectional_relationship(ggmother1, gfather1, 'parent', 'child')
create_bidirectional_relationship(ggfather2, gfather2, 'parent', 'child')
create_bidirectional_relationship(ggmother2, gfather2, 'parent', 'child')
# Grandparents married
create_bidirectional_relationship(gfather1, gmother1, 'spouse', 'spouse')
create_bidirectional_relationship(gfather2, gmother2, 'spouse', 'spouse')
# Grandparents' children (parents, aunts/uncles)
create_bidirectional_relationship(gfather1, father, 'parent', 'child')
create_bidirectional_relationship(gmother1, father, 'parent', 'child')
create_bidirectional_relationship(gfather1, aunt1, 'parent', 'child')
create_bidirectional_relationship(gmother1, aunt1, 'parent', 'child')
create_bidirectional_relationship(gfather2, mother, 'parent', 'child')
create_bidirectional_relationship(gmother2, mother, 'parent', 'child')
create_bidirectional_relationship(gfather2, uncle1, 'parent', 'child')
create_bidirectional_relationship(gmother2, uncle1, 'parent', 'child')
# Parents married
create_bidirectional_relationship(father, mother, 'spouse', 'spouse')
# Aunts/uncles married (optional, for more connections)
# create_bidirectional_relationship(aunt1, uncle1, 'spouse', 'spouse')
# Parents' children
create_bidirectional_relationship(father, child1, 'parent', 'child')
create_bidirectional_relationship(mother, child1, 'parent', 'child')
create_bidirectional_relationship(father, child2, 'parent', 'child')
create_bidirectional_relationship(mother, child2, 'parent', 'child')
# Uncle's children (cousins)
create_bidirectional_relationship(uncle1, cousin1, 'parent', 'child')
create_bidirectional_relationship(uncle1, cousin2, 'parent', 'child')
# Aunt's children (none in this example, but can add if desired)
# Sibling relationships
create_bidirectional_relationship(child1, child2, 'sibling', 'sibling')
create_bidirectional_relationship(cousin1, cousin2, 'sibling', 'sibling')
# Cousin relationships
create_bidirectional_relationship(child1, cousin1, 'cousin', 'cousin')
create_bidirectional_relationship(child2, cousin2, 'cousin', 'cousin')

puts "Seed data created successfully!"