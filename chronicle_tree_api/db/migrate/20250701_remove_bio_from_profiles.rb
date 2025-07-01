class RemoveBioFromProfiles < ActiveRecord::Migration[7.0]
  def change
    remove_column :profiles, :bio, :text
  end
end
