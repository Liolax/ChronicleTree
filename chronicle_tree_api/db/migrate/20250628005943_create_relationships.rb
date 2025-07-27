# Database migration creating relationships table for family connections
# Manages bidirectional genealogical relationships between people
class CreateRelationships < ActiveRecord::Migration[8.0]
  def change
    create_table :relationships do |t|
      t.references :person, null: false, foreign_key: true
      t.references :relative, null: false, foreign_key: { to_table: :people }
      t.string     :relationship_type, null: false
      t.timestamps
    end
  end
end
