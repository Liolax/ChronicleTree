# Database migration creating share_images table for generated social media images
# Manages temporary image files with expiration and performance metadata
class CreateShareImages < ActiveRecord::Migration[8.0]
  def change
    create_table :share_images do |t|
      t.references :person, null: false, foreign_key: true
      t.string :image_type, null: false
      t.string :file_path, null: false, limit: 500
      t.datetime :expires_at, null: false
      t.json :metadata, default: {}
      t.integer :file_size
      t.integer :generation_time_ms

      t.timestamps
    end

    # Database indexes for efficient querying of share images
    add_index :share_images, [:person_id, :image_type]
    add_index :share_images, :expires_at
    add_index :share_images, :image_type
    
    # Data validation constraints for image type and expiration logic
    add_check_constraint :share_images, 
      "image_type IN ('profile', 'tree')", 
      name: 'valid_image_type'
    
    add_check_constraint :share_images,
      "expires_at > created_at",
      name: 'valid_expiry_date'
  end
end
