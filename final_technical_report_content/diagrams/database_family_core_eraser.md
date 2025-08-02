// ChronicleTree Family Tree Core Schema
// For use with app.eraser.io
// People, profiles, and family relationships

title ChronicleTree Family Tree Core

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

// --- Relationships ---
people.id > profiles.person_id
people.id > notes.person_id
people.id > relationships.person_id
people.id > relationships.relative_id
people.id > relationships.shared_parent_id

// Family Tree Features:
// - Bidirectional family relationships with validation
// - Comprehensive relationship types: spouse, parent, child, sibling
// - Ex-spouse and deceased spouse tracking
// - Step-family support via shared_parent_id
// - One profile per person with avatar support
// - Personal notes for each family member
