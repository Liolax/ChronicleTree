class CreateFacts < ActiveRecord::Migration[8.0]
  def change
    create_table :facts do |t|
      t.references :person, null: false, foreign_key: true
      t.string :label
      t.string :value
      t.date :date
      t.string :location

      t.timestamps
    end
  end
end
