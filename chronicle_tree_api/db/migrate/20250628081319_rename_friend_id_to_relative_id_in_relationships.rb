class RenameFriendIdToRelativeIdInRelationships < ActiveRecord::Migration[8.0]
  def change
    rename_column :relationships, :friend_id, :relative_id
  end
end
