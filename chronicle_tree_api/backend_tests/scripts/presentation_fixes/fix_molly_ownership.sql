-- SQL script to fix Molly's user ownership issue
-- This will ensure all people belong to user ID 1 (the test user)

-- First, let's see the current state
SELECT 
    id, first_name, last_name, user_id, date_of_death, is_deceased
FROM people 
WHERE first_name = 'Molly' AND last_name = 'Doe';

-- Update all people to belong to user ID 1 (the test user)
UPDATE people SET user_id = 1 WHERE user_id != 1;

-- Verify the fix
SELECT 
    id, first_name, last_name, user_id, date_of_death, is_deceased
FROM people 
WHERE first_name = 'Molly' AND last_name = 'Doe';

-- Show all users and their people count
SELECT 
    users.id, 
    users.email, 
    COUNT(people.id) as people_count
FROM users 
LEFT JOIN people ON users.id = people.user_id 
GROUP BY users.id, users.email
ORDER BY users.id;