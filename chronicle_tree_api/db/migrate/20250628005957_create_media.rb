class CreateMedia < ActiveRecord::Migration[8.0]
  def change
    create_table :media do |t|
      t.references :attachable, polymorphic: true, null: false
      t.string :description

      t.timestamps
    end
  end
end
