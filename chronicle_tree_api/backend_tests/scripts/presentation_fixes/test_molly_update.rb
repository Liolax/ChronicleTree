# Test making Molly alive after fixing the issues
require_relative '../../config/environment'

puts "=== TESTING MOLLY MARRIAGE LOGIC FIX ==="

molly = Person.find(26)
robert = Person.find(27)

puts "Before update:"
puts "  Molly death date: #{molly.date_of_death || 'nil'}"
puts "  Robert current spouses: #{robert.current_spouses.map(&:full_name).join(', ')}"
puts ""

puts "Attempting to make Molly alive (remove death date)..."

begin
  molly.update!(date_of_death: nil, is_deceased: false)
  molly.reload
  puts "SUCCESS: Molly updated successfully"
  puts "  Molly death date: #{molly.date_of_death || 'nil'}"
  puts "  Molly is_deceased: #{molly.is_deceased}"
  puts "  Robert current spouses: #{robert.current_spouses.map(&:full_name).join(', ')}"
rescue => e
  puts "ERROR: #{e.message}"
  puts "Error class: #{e.class}"
  puts "Backtrace:"
  puts e.backtrace.first(5).join("\n")
end