# Database migration creating timeline_items table for chronological life events
# Stores dated biographical milestones with location and visual indicators
class CreateTimelineItems < ActiveRecord::Migration[8.0]
  def change
    create_table :timeline_items do |t|
      t.references :person, null: false, foreign_key: true
      t.string :title
      t.date :date
      t.string :place
      t.string :icon

      t.timestamps
    end
  end
end
