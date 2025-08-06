# Minimal test for person 26 update issue
require_relative 'config/environment'

puts "=== MINIMAL PERSON 26 TEST ==="

person = Person.find_by(id: 26)
if person.nil?
  puts "Person 26 not found"
  exit 1
end

puts "Person 26: #{person.first_name} #{person.last_name}"
puts "Before: deceased=#{person.is_deceased}, death_date=#{person.date_of_death}"

begin
  # Try the simplest possible update
  person.date_of_death = nil
  person.is_deceased = false
  person.save!
  
  puts "After: deceased=#{person.is_deceased}, death_date=#{person.date_of_death}"
  puts "✅ SUCCESS: Person 26 updated without errors!"
  
rescue => e
  puts "❌ ERROR: #{e.message}"
  puts "Class: #{e.class}"
  if e.respond_to?(:record)
    puts "Record errors: #{e.record.errors.full_messages}"
  end
  puts "Backtrace:"
  puts e.backtrace[0..5]
end
