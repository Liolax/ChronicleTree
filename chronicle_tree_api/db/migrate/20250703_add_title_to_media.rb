class AddTitleToMedia < ActiveRecord::Migration[7.0]
  def change
    add_column :media, :title, :string
  end
end
