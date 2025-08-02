// ChronicleTree Database Schema Design (ERD)
// For use with app.eraser.io
// Based on ACTUAL Rails schema.rb and models

title ChronicleTree Database Schema - ACTUAL IMPLEMENTATION

// Core User Authentication (Devise + JWT)
users [icon: user, color: blue] {
  id bigint pk
  email varchar(255) unique
  encrypted_password varchar(255)
  name varchar(255)
  reset_password_token varchar(255)
  reset_password_sent_at timestamp
  remember_created_at timestamp
  admin boolean
  created_at timestamp
  updated_at timestamp
}

jwt_denylists [icon: lock, color: black] {
  id bigint pk
  jti varchar(255) unique
  exp timestamp
  created_at timestamp
  updated_at timestamp
}

// Family Tree Core Models
people [icon: users, color: green] {
  id bigint pk
  user_id bigint fk
  first_name varchar(255)
  last_name varchar(255)
  date_of_birth date
  date_of_death date
  gender varchar(255)
  is_deceased boolean
  created_at timestamp
  updated_at timestamp
}

profiles [icon: id-card, color: lightblue] {
  id bigint pk
  person_id bigint fk
  created_at timestamp
  updated_at timestamp
}

notes [icon: book, color: brown] {
  id bigint pk
  person_id bigint fk unique
  content text
  created_at timestamp
  updated_at timestamp
}

relationships [icon: link, color: orange] {
  id bigint pk
  person_id bigint fk
  relative_id bigint fk
  relationship_type varchar(255)
  is_ex boolean
  is_deceased boolean
  shared_parent_id integer
  created_at timestamp
  updated_at timestamp
}

// Life Events and Information
timeline_items [icon: calendar, color: teal] {
  id bigint pk
  person_id bigint fk
  title varchar(255)
  description text
  date date
  place varchar(255)
  icon varchar(255)
  created_at timestamp
  updated_at timestamp
}

facts [icon: file-text, color: purple] {
  id bigint pk
  person_id bigint fk
  label varchar(255)
  value varchar(255)
  date date
  location varchar(255)
  created_at timestamp
  updated_at timestamp
}

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

// Social Sharing System
shares [icon: share, color: yellow] {
  id bigint pk
  user_id bigint fk
  content_type varchar(255)
  content_id integer
  platform varchar(255)
  caption text
  share_token varchar(255) unique
  shared_at timestamp
  created_at timestamp
  updated_at timestamp
}

share_images [icon: camera, color: pink] {
  id bigint pk
  person_id bigint fk
  image_type varchar(255)
  file_path varchar(500)
  expires_at timestamp
  metadata json
  file_size integer
  generation_time_ms integer
  created_at timestamp
  updated_at timestamp
}

// --- Relationships ---
users.id > people.user_id
people.id > profiles.person_id
people.id > notes.person_id
people.id > relationships.person_id
people.id > relationships.relative_id
people.id > relationships.shared_parent_id
people.id > timeline_items.person_id
people.id > facts.person_id
people.id > share_images.person_id
users.id > shares.user_id

// Active Storage Relationships
active_storage_attachments.blob_id > active_storage_blobs.id
active_storage_variant_records.blob_id > active_storage_blobs.id

// Polymorphic Media Connections:
// When media.attachable_type = "Person":
people.id > media.attachable_id
// When media.attachable_type = "Profile": 
profiles.id > media.attachable_id

// Active Storage File Attachments:
// Files are attached via active_storage_attachments polymorphically
media.id > active_storage_attachments.record_id
profiles.id > active_storage_attachments.record_id

// Polymorphic Media System:
// media.attachable_type = "Person" -> media.attachable_id = people.id
// media.attachable_type = "Profile" -> media.attachable_id = profiles.id
// Files attached via active_storage_attachments where record_type matches attachable_type

// Key Application Features:
// - JWT authentication with blacklist for security
// - Polymorphic media attachments for people and profiles
// - Bidirectional family relationships with validation
// - Social sharing with generated image caching
// - Timeline events and custom facts system
// - Comprehensive relationship types: spouse, parent, child, sibling
// - Ex-spouse and deceased spouse tracking
// - Step-family support via shared_parent_id
