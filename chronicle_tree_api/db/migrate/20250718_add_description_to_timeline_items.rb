class AddDescriptionToTimelineItems < ActiveRecord::Migration[7.0]
  def change
    add_column :timeline_items, :description, :text
  end
end
