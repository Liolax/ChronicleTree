# Figure 2.2.4: Database Entity Relationship Diagram
## ChronicleTree Actual Database Schema with Real Data

**For use with app.eraser.io:**

```
title ChronicleTree Database ERD - Actual Implementation

// Authentication & Security (Real Implementation)
users [icon: user, color: blue] {
  id bigint pk
  email varchar(255) unique
  encrypted_password varchar(255)
  name varchar(255)
  admin boolean default false
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

// Family Tree Core (18 People Records)
people [icon: users, color: green] {
  id bigint pk
  user_id bigint fk
  first_name varchar(255)
  last_name varchar(255)
  birth_date date
  death_date date
  gender varchar(50)
  is_deceased boolean default false
  created_at timestamp
  updated_at timestamp
}

// 54 Relationship Records
relationships [icon: link, color: orange] {
  id bigint pk
  person_id bigint fk
  relative_id bigint fk
  relationship_type varchar(50)
  is_deceased boolean default false
  is_ex boolean default false
  shared_parent_id bigint fk
  start_date date
  end_date date
  created_at timestamp
  updated_at timestamp
}

// 80+ Timeline Events
timeline_items [icon: calendar, color: teal] {
  id bigint pk
  person_id bigint fk
  title varchar(255)
  description text
  event_date date
  event_type varchar(255)
  location varchar(255)
  created_at timestamp
  updated_at timestamp
}

// Custom Facts System
facts [icon: list, color: purple] {
  id bigint pk
  person_id bigint fk
  fact_type varchar(255)
  value text
  date date
  location varchar(255)
  created_at timestamp
  updated_at timestamp
}

// Media Management (Active Storage Integration)
media [icon: image, color: red] {
  id bigint pk
  person_id bigint fk
  file_url varchar(255)
  file_type varchar(255)
  title varchar(255)
  description text
  date_taken date
  created_at timestamp
  updated_at timestamp
}

// Social Sharing System
shares [icon: share, color: yellow] {
  id bigint pk
  user_id bigint fk
  shareable_type varchar(255)
  shareable_id bigint
  token varchar(255) unique
  view_count integer default 0
  created_at timestamp
  updated_at timestamp
}

share_images [icon: camera, color: pink] {
  id bigint pk
  person_id bigint fk
  image_type varchar(255)
  file_path varchar(500)
  expires_at timestamp
  metadata jsonb
  file_size integer
  generation_time_ms integer
  created_at timestamp
  updated_at timestamp
}

// 144+ Audit Records
versions [icon: history, color: gray] {
  id bigint pk
  item_type varchar(255)
  item_id bigint
  event varchar(255)
  whodunnit varchar(255)
  object text
  object_changes text
  created_at timestamp
}

// Personal Notes System
notes [icon: book, color: brown] {
  id bigint pk
  person_id bigint fk unique
  content text
  created_at timestamp
  updated_at timestamp
}

// Relationships (Actual Foreign Keys)
users.id >> people.user_id
users.id >> shares.user_id
people.id >> relationships.person_id
people.id >> relationships.relative_id
people.id >> relationships.shared_parent_id
people.id >> timeline_items.person_id
people.id >> facts.person_id
people.id >> media.person_id
people.id >> share_images.person_id
people.id >> notes.person_id

// Polymorphic Relationships
shares.shareable_id >> people.id (when shareable_type = 'Person')
versions.item_id >> people.id (when item_type = 'Person')
versions.item_id >> relationships.id (when item_type = 'Relationship')
```

**Database Statistics (Real Data):**
- **Users**: Single test user account (test@example.com)
- **People**: 18 family members with complete profiles
- **Relationships**: 54 relationship connections (spouse, parent, child, sibling)
- **Timeline Events**: 80+ life events with dates and locations
- **Audit Records**: 144+ tracked changes via PaperTrail
- **JWT Tokens**: 42 active denylist entries for security
- **Media Files**: Variable count with Active Storage integration