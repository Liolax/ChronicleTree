# Database migration adding gender column to people table
# Enables gender-specific relationship terminology and genealogical accuracy
class AddGenderToPeople < ActiveRecord::Migration[7.1]
  def change
    add_column :people, :gender, :string
  end
end
