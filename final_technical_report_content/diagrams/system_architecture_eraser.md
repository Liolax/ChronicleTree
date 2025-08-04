// ChronicleTree System Architecture Overview
// For use with app.eraser.io

title ChronicleTree System Architecture Overview

// Define cloud/group styles
Frontend [icon: monitor, color: blue] {
  React App [icon: react, color: lightblue]
  Family Tree [icon: tree, color: green]
  User Interface [icon: user, color: purple]
}

Backend [icon: server, color: darkblue] {
  Rails API [icon: ruby, color: red]
  Authentication [icon: shield, color: orange]
  Core Services [icon: gear, color: gray]
}

Data Layer [icon: database, color: green] {
  PostgreSQL [icon: database, color: blue]
  File Storage [icon: folder, color: orange]
  Cache System [icon: memory, color: teal]
}

// Define connections
React App > Rails API: API Requests
Family Tree > Core Services: Tree Operations
User Interface > Authentication: Login/Auth

Rails API > Core Services: Business Logic
Core Services > PostgreSQL: Data Access
Authentication > PostgreSQL: User Validation

Core Services > File Storage: Media Files
Rails API > Cache System: Performance
