class EnsureNotesOnProfiles < ActiveRecord::Migration[7.0]
  def change
    change_column_default :profiles, :notes, ''
    change_column_null :profiles, :notes, false
  end
end
