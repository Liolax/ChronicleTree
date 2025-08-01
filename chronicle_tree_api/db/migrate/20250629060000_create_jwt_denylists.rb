# Database migration creating JWT denylist table for token invalidation
# Maintains revoked authentication tokens for security enforcement
class CreateJwtDenylists < ActiveRecord::Migration[8.0]
  def change
    create_table :jwt_denylists do |t|
      t.string   :jti, null: false
      t.datetime :exp, null: false
      t.timestamps
    end
    add_index :jwt_denylists, :jti, unique: true
  end
end
