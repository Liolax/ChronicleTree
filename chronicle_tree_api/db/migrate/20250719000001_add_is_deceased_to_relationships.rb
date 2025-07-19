class AddIsDeceasedToRelationships < ActiveRecord::Migration[7.0]
  def change
    add_column :relationships, :is_deceased, :boolean, default: false, null: false
    
    # Add index for performance when querying deceased spouses
    add_index :relationships, [:relationship_type, :is_deceased], name: "index_relationships_on_type_and_deceased"
  end
end
