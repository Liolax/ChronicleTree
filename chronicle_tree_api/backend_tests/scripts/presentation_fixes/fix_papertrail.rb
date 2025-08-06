# Fix PaperTrail user_id column issue
require_relative '../../config/environment'

puts "=== ADDING MISSING USER_ID COLUMN TO VERSIONS TABLE ==="

if !ActiveRecord::Base.connection.column_exists?(:versions, :user_id)
  ActiveRecord::Base.connection.add_column :versions, :user_id, :integer
  puts "Added user_id column to versions table"
else
  puts "user_id column already exists"
end

puts "Fix completed!"