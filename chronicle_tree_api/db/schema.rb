# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_07_20_163104) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "facts", force: :cascade do |t|
    t.bigint "person_id", null: false
    t.string "label"
    t.string "value"
    t.date "date"
    t.string "location"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["person_id"], name: "index_facts_on_person_id"
  end

  create_table "jwt_denylists", force: :cascade do |t|
    t.string "jti", null: false
    t.datetime "exp", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jti"], name: "index_jwt_denylists_on_jti", unique: true
  end

  create_table "media", force: :cascade do |t|
    t.string "attachable_type", null: false
    t.bigint "attachable_id", null: false
    t.string "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "title"
    t.index ["attachable_type", "attachable_id"], name: "index_media_on_attachable"
  end

  create_table "notes", force: :cascade do |t|
    t.bigint "person_id", null: false
    t.text "content", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["person_id"], name: "index_notes_on_person_id", unique: true
  end

  create_table "people", force: :cascade do |t|
    t.string "first_name"
    t.string "last_name"
    t.date "date_of_birth"
    t.date "date_of_death"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "gender"
    t.boolean "is_deceased", default: false, null: false
    t.index ["user_id"], name: "index_people_on_user_id"
  end

  create_table "profiles", force: :cascade do |t|
    t.bigint "person_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["person_id"], name: "index_profiles_on_person_id"
  end

  create_table "relationships", force: :cascade do |t|
    t.bigint "person_id", null: false
    t.bigint "relative_id", null: false
    t.string "relationship_type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_ex", default: false, null: false
    t.boolean "is_deceased", default: false, null: false
    t.index ["person_id"], name: "index_relationships_on_person_id"
    t.index ["relationship_type", "is_deceased"], name: "index_relationships_on_type_and_deceased"
    t.index ["relative_id"], name: "index_relationships_on_relative_id"
  end

  create_table "share_images", force: :cascade do |t|
    t.bigint "person_id", null: false
    t.string "image_type", null: false
    t.string "file_path", limit: 500, null: false
    t.datetime "expires_at", null: false
    t.json "metadata", default: {}
    t.integer "file_size"
    t.integer "generation_time_ms"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_share_images_on_expires_at"
    t.index ["image_type"], name: "index_share_images_on_image_type"
    t.index ["person_id", "image_type"], name: "index_share_images_on_person_id_and_image_type"
    t.index ["person_id"], name: "index_share_images_on_person_id"
    t.check_constraint "expires_at > created_at", name: "valid_expiry_date"
    t.check_constraint "image_type::text = ANY (ARRAY['profile'::character varying, 'tree'::character varying]::text[])", name: "valid_image_type"
  end

  create_table "shares", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "content_type", null: false
    t.integer "content_id"
    t.string "platform", null: false
    t.text "caption"
    t.string "share_token", null: false
    t.datetime "shared_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["content_type", "content_id"], name: "index_shares_on_content_type_and_content_id"
    t.index ["platform"], name: "index_shares_on_platform"
    t.index ["share_token"], name: "index_shares_on_share_token", unique: true
    t.index ["user_id"], name: "index_shares_on_user_id"
  end

  create_table "timeline_items", force: :cascade do |t|
    t.bigint "person_id", null: false
    t.string "title"
    t.date "date"
    t.string "place"
    t.string "icon"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "description"
    t.index ["person_id"], name: "index_timeline_items_on_person_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.boolean "admin"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "facts", "people"
  add_foreign_key "notes", "people"
  add_foreign_key "people", "users"
  add_foreign_key "profiles", "people"
  add_foreign_key "relationships", "people"
  add_foreign_key "relationships", "people", column: "relative_id"
  add_foreign_key "share_images", "people"
  add_foreign_key "shares", "users"
  add_foreign_key "timeline_items", "people"
end
