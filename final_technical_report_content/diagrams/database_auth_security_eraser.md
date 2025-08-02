// ChronicleTree Authentication & Security Schema
// For use with app.eraser.io
// User authentication and JWT security system

title ChronicleTree Authentication & Security

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

// Security Features:
// - JWT authentication with blacklist for revoked tokens
// - Devise password reset and remember functionality
// - Admin role support for system administration
// - Secure token-based authentication with expiration
