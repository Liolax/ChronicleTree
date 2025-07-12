class AddIsExToRelationships < ActiveRecord::Migration[7.0]
  def change
    add_column :relationships, :is_ex, :boolean, default: false, null: false
  end
end
