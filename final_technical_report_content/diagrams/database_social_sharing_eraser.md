// ChronicleTree Social Sharing Schema
// For use with app.eraser.io
// Social media sharing and image generation system

title ChronicleTree Social Sharing

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

users [icon: user, color: blue] {
  id bigint pk
  name varchar(255)
  email varchar(255)
}

people [icon: users, color: green] {
  id bigint pk
  first_name varchar(255)
  last_name varchar(255)
}

// --- Relationships ---
users.id > shares.user_id
people.id > share_images.person_id

// Social Sharing Features:
// - Multi-platform sharing (Facebook, Twitter, WhatsApp, Email)
// - Generated share images with expiration
// - Unique share tokens for tracking
// - Profile and tree sharing types
// - Platform-specific content generation
// - Performance tracking with generation time metrics
