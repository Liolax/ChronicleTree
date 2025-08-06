# frozen_string_literal: true

# Migration to create PaperTrail versions table for comprehensive audit logging
class CreateVersions < ActiveRecord::Migration[8.0]
  def change
    create_table :versions do |t|
      t.string   :item_type, null: false
      t.bigint   :item_id,   null: false
      t.string   :event,     null: false
      t.string   :whodunnit
      t.text     :object
      t.text     :object_changes
      
      # Additional metadata for comprehensive auditing
      t.string   :user_email
      t.string   :ip_address
      t.text     :user_agent
      t.string   :request_id
      
      t.datetime :created_at
    end
    
    add_index :versions, [:item_type, :item_id]
    add_index :versions, :whodunnit
    add_index :versions, :created_at
    add_index :versions, :request_id
  end
end
