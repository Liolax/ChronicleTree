-- ChronicleTree Database Cleanup: Remove Cross-Generational Sibling Relationships
-- This SQL script identifies and removes invalid sibling relationships between different generations

-- 1. PREVIEW: Show invalid cross-generational sibling relationships
-- (Run this first to see what will be removed)

SELECT 
    'INVALID SIBLING' as issue_type,
    p1.first_name as person1_name,
    p1.last_name as person1_last,
    p2.first_name as person2_name, 
    p2.last_name as person2_last,
    'Should be generational relationship instead' as note
FROM relationships r
JOIN people p1 ON r.person_a_id = p1.id
JOIN people p2 ON r.person_b_id = p2.id
WHERE r.relationship_type = 'Sibling'
AND (
    -- Check if person1 is ancestor of person2
    EXISTS (
        WITH RECURSIVE ancestors(id, depth) AS (
            SELECT person_a_id, 1 FROM relationships 
            WHERE person_b_id = r.person_b_id AND relationship_type = 'Parent'
            UNION ALL
            SELECT rel.person_a_id, a.depth + 1 
            FROM relationships rel
            JOIN ancestors a ON rel.person_b_id = a.id
            WHERE rel.relationship_type = 'Parent' AND a.depth < 10
        )
        SELECT 1 FROM ancestors WHERE id = r.person_a_id
    )
    OR
    -- Check if person2 is ancestor of person1
    EXISTS (
        WITH RECURSIVE ancestors(id, depth) AS (
            SELECT person_a_id, 1 FROM relationships 
            WHERE person_b_id = r.person_a_id AND relationship_type = 'Parent'
            UNION ALL
            SELECT rel.person_a_id, a.depth + 1 
            FROM relationships rel
            JOIN ancestors a ON rel.person_b_id = a.id
            WHERE rel.relationship_type = 'Parent' AND a.depth < 10
        )
        SELECT 1 FROM ancestors WHERE id = r.person_b_id
    )
);

-- 2. CLEANUP: Remove the invalid relationships
-- (Uncomment and run this after reviewing the preview above)

/*
DELETE FROM relationships 
WHERE relationship_type = 'Sibling'
AND (
    -- Remove relationships where one person is ancestor of the other
    EXISTS (
        WITH RECURSIVE ancestors(id, depth) AS (
            SELECT person_a_id, 1 FROM relationships r2
            WHERE r2.person_b_id = relationships.person_b_id AND r2.relationship_type = 'Parent'
            UNION ALL
            SELECT rel.person_a_id, a.depth + 1 
            FROM relationships rel
            JOIN ancestors a ON rel.person_b_id = a.id
            WHERE rel.relationship_type = 'Parent' AND a.depth < 10
        )
        SELECT 1 FROM ancestors WHERE id = relationships.person_a_id
    )
    OR
    EXISTS (
        WITH RECURSIVE ancestors(id, depth) AS (
            SELECT person_a_id, 1 FROM relationships r2
            WHERE r2.person_b_id = relationships.person_a_id AND r2.relationship_type = 'Parent'
            UNION ALL
            SELECT rel.person_a_id, a.depth + 1 
            FROM relationships rel
            JOIN ancestors a ON rel.person_b_id = a.id
            WHERE rel.relationship_type = 'Parent' AND a.depth < 10
        )
        SELECT 1 FROM ancestors WHERE id = relationships.person_b_id
    )
);
*/

-- 3. VERIFICATION: Count relationships before and after
SELECT 
    relationship_type,
    COUNT(*) as count
FROM relationships 
GROUP BY relationship_type
ORDER BY relationship_type;

-- 4. SPECIFIC MOLLY CASE: Find Molly's relationships
-- (Replace 'Molly' with the actual first name if different)

SELECT 
    'Molly Relationships' as category,
    p1.first_name as molly_name,
    r.relationship_type,
    p2.first_name as related_person,
    p2.last_name as related_last_name
FROM relationships r
JOIN people p1 ON r.person_a_id = p1.id  
JOIN people p2 ON r.person_b_id = p2.id
WHERE p1.first_name LIKE '%Molly%'
UNION ALL
SELECT 
    'People related to Molly' as category,
    p2.first_name as person_name,
    r.relationship_type,
    p1.first_name as molly_name,
    p1.last_name as molly_last_name
FROM relationships r
JOIN people p1 ON r.person_b_id = p1.id  
JOIN people p2 ON r.person_a_id = p2.id
WHERE p1.first_name LIKE '%Molly%'
ORDER BY category, relationship_type;
