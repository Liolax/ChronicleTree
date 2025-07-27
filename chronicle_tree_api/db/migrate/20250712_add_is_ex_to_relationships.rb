# Database migration adding is_ex flag to relationships table
# Enables tracking of former romantic relationships in family tree context
class AddIsExToRelationships < ActiveRecord::Migration[7.0]
  def change
    add_column :relationships, :is_ex, :boolean, default: false, null: false
  end
end
