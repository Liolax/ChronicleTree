// ChronicleTree Complete Database Overview
// For use with app.eraser.io
// High-level view showing all domain connections

title ChronicleTree Database Overview

// Authentication Domain
users [icon: user, color: blue] {
  id bigint pk
  email varchar(255)
  name varchar(255)
}

jwt_denylists [icon: lock, color: black] {
  id bigint pk
  jti varchar(255)
  exp timestamp
}

// Family Tree Domain
people [icon: users, color: green] {
  id bigint pk
  user_id bigint fk
  first_name varchar(255)
  last_name varchar(255)
}

relationships [icon: link, color: orange] {
  id bigint pk
  person_id bigint fk
  relative_id bigint fk
  relationship_type varchar(255)
}

// Content Domain
timeline_items [icon: calendar, color: teal] {
  id bigint pk
  person_id bigint fk
  title varchar(255)
}

facts [icon: file-text, color: purple] {
  id bigint pk
  person_id bigint fk
  label varchar(255)
}

// Media Domain
media [icon: image, color: red] {
  id bigint pk
  attachable_type varchar(255)
  attachable_id bigint
}

active_storage_blobs [icon: database, color: gray] {
  id bigint pk
  key varchar(255)
  filename varchar(255)
}

// Sharing Domain
shares [icon: share, color: yellow] {
  id bigint pk
  user_id bigint fk
  platform varchar(255)
}

// --- Key Relationships ---
users.id > people.user_id
people.id > relationships.person_id
people.id > timeline_items.person_id
people.id > facts.person_id
people.id > media.attachable_id
users.id > shares.user_id

// Domain Summary:
// Authentication: Users, JWT security
// Family Tree: People, relationships, profiles
// Content: Timeline events, custom facts
// Media: Polymorphic file attachments
// Sharing: Social media integration
