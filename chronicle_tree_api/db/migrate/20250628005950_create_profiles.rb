class CreateProfiles < ActiveRecord::Migration[8.0]
  def change
    create_table :profiles do |t|
      t.references :person, null: false, foreign_key: true
      t.text :bio
      t.text :notes

      t.timestamps
    end
  end
end
