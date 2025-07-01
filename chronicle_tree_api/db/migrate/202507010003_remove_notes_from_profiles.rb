class RemoveNotesFromProfiles < ActiveRecord::Migration[7.0]
  def change
    remove_column :profiles, :notes, :text
  end
end
