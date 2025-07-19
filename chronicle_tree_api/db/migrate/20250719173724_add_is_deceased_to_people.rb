class AddIsDeceasedToPeople < ActiveRecord::Migration[8.0]
  def change
    add_column :people, :is_deceased, :boolean, default: false, null: false
  end
end
