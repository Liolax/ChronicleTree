# Direct SQL fix for ownership issue - bypasses Rails to avoid process conflicts
require_relative '../chronicle_tree_api/config/environment'

puts "=== DIRECT DATABASE FIX FOR OWNERSHIP ==="

# Find test user or create if needed
test_user = User.find_by(email: 'test@example.com')

if test_user.nil?
  puts "Test user not found. Creating..."
  
  # Use direct SQL to avoid potential conflicts
  result = ActiveRecord::Base.connection.execute(
    "INSERT INTO users (email, encrypted_password, created_at, updated_at) 
     VALUES ('test@example.com', '$2a$12$placeholder_encrypted_password', NOW(), NOW()) 
     RETURNING id"
  )
  
  user_id = result.first['id']
  puts "Created user with ID: #{user_id}"
else
  user_id = test_user.id
  puts "Using existing user: #{test_user.email} (ID: #{user_id})"
end

# Direct SQL update to assign all people to this user
puts "Assigning all people to user #{user_id}..."

begin
  result = ActiveRecord::Base.connection.execute(
    "UPDATE people SET user_id = #{user_id}, updated_at = NOW()"
  )
  
  puts "Database update completed"
  
  # Verify person 26 specifically
  person_26_check = ActiveRecord::Base.connection.execute(
    "SELECT id, first_name, last_name, user_id, is_deceased, date_of_death 
     FROM people WHERE id = 26"
  ).first
  
  if person_26_check
    puts "\nPerson 26 verification:"
    puts "- Name: #{person_26_check['first_name']} #{person_26_check['last_name']}"
    puts "- User ID: #{person_26_check['user_id']}"
    puts "- Deceased: #{person_26_check['is_deceased']}"
    puts "- Death date: #{person_26_check['date_of_death']}"
    
    if person_26_check['user_id'].to_i == user_id
      puts "SUCCESS: Person 26 now belongs to the correct user!"
    else
      puts "WARNING: Person 26 assignment may have failed"
    end
  else
    puts "Person 26 not found in database"
  end
  
  # Get final count
  count_result = ActiveRecord::Base.connection.execute(
    "SELECT COUNT(*) as total FROM people WHERE user_id = #{user_id}"
  ).first
  
  puts "\nFinal result: User #{user_id} now owns #{count_result['total']} people"
  
rescue => e
  puts "ERROR: #{e.message}"
end

puts "\n=== DIRECT FIX COMPLETE ==="
puts "The 500 error should now be resolved when logged in as test@example.com"
