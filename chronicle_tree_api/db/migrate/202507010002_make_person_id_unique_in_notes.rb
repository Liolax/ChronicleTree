class MakePersonIdUniqueInNotes < ActiveRecord::Migration[7.0]
  def change
    unless index_exists?(:notes, :person_id, unique: true)
      add_index :notes, :person_id, unique: true
    end
  end
end
