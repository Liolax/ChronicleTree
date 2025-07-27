# Database migration creating shares table for social media sharing functionality
# Tracks shared family tree content with platform-specific metadata
class CreateShares < ActiveRecord::Migration[7.0]
  def change
    create_table :shares do |t|
      t.references :user, null: false, foreign_key: true
      t.string :content_type, null: false
      t.integer :content_id
      t.string :platform, null: false
      t.text :caption
      t.string :share_token, null: false
      t.datetime :shared_at
      t.timestamps
    end
    
    add_index :shares, :share_token, unique: true
    add_index :shares, [:content_type, :content_id]
    add_index :shares, :platform
  end
end