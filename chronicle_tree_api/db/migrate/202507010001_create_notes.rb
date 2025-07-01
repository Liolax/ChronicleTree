class CreateNotes < ActiveRecord::Migration[7.0]
  def change
    create_table :notes do |t|
      t.references :person, null: false, foreign_key: true
      t.text :content, null: false, default: ""
      t.timestamps
    end
  end
end
