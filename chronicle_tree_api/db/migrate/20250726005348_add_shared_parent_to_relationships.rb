class AddSharedParentToRelationships < ActiveRecord::Migration[8.0]
  def change
    add_column :relationships, :shared_parent_id, :integer
    add_foreign_key :relationships, :people, column: :shared_parent_id
    add_index :relationships, :shared_parent_id
  end
end
