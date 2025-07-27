# Database migration creating people table for family tree person records
# Stores individual biographical data and links to user accounts
class CreatePeople < ActiveRecord::Migration[8.0]
  def change
    create_table :people do |t|
      t.string :first_name
      t.string :last_name
      t.date :date_of_birth
      t.date :date_of_death
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
