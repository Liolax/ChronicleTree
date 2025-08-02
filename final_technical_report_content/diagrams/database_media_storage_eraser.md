// ChronicleTree Media & File Storage Schema
// For use with app.eraser.io
// Polymorphic media system with Active Storage

title ChronicleTree Media & File Storage

// Media System (Polymorphic with Active Storage)
media [icon: image, color: red] {
  id bigint pk
  attachable_type varchar(255)
  attachable_id bigint
  title varchar(255)
  description varchar(255)
  created_at timestamp
  updated_at timestamp
}

active_storage_blobs [icon: database, color: gray] {
  id bigint pk
  key varchar(255) unique
  filename varchar(255)
  content_type varchar(255)
  metadata text
  service_name varchar(255)
  byte_size bigint
  checksum varchar(255)
  created_at timestamp
}

active_storage_attachments [icon: paperclip, color: gray] {
  id bigint pk
  name varchar(255)
  record_type varchar(255)
  record_id bigint
  blob_id bigint fk
  created_at timestamp
}

active_storage_variant_records [icon: settings, color: gray] {
  id bigint pk
  blob_id bigint fk
  variation_digest varchar(255)
}

people [icon: users, color: green] {
  id bigint pk
  first_name varchar(255)
  last_name varchar(255)
}

profiles [icon: id-card, color: lightblue] {
  id bigint pk
  person_id bigint fk
}

// --- Relationships ---
active_storage_attachments.blob_id > active_storage_blobs.id
active_storage_variant_records.blob_id > active_storage_blobs.id

// Polymorphic Media Connections:
people.id > media.attachable_id
profiles.id > media.attachable_id

// Active Storage File Attachments:
media.id > active_storage_attachments.record_id
profiles.id > active_storage_attachments.record_id

// Media System Features:
// - Polymorphic media attachments for people and profiles
// - Active Storage for cloud-compatible file management
// - Image variants for different sizes and formats
// - Metadata tracking for file properties
// - Secure file storage with integrity checking
