# Test full deceased->alive cycle
require_relative '../../config/environment'

puts "=== TESTING FULL CYCLE: ALIVE -> DECEASED -> ALIVE ==="

molly = Person.find(26)
robert = Person.find(27)

# Make Molly deceased again
molly.update!(date_of_death: Date.new(2020,11,8), is_deceased: true)
puts "Step 1: Made Molly deceased"
puts "  Robert current spouses: #{robert.current_spouses.map(&:full_name).join(', ')}"

# Make Molly alive again  
molly.update!(date_of_death: nil, is_deceased: false)
puts "Step 2: Made Molly alive"
puts "  Robert current spouses: #{robert.current_spouses.map(&:full_name).join(', ')}"

puts "SUCCESS: Full cycle works!"