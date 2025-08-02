// ChronicleTree Life Events & Information Schema
// For use with app.eraser.io
// Timeline events and custom facts system

title ChronicleTree Life Events & Information

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

people [icon: users, color: green] {
  id bigint pk
  user_id bigint fk
  first_name varchar(255)
  last_name varchar(255)
  created_at timestamp
  updated_at timestamp
}

// --- Relationships ---
people.id > timeline_items.person_id
people.id > facts.person_id

// Life Events Features:
// - Timeline events with dates, places, and custom icons
// - Custom facts system for genealogical data
// - Flexible label-value pairs for any type of information
// - Location and date tracking for historical context
// - Rich descriptions for detailed life stories
