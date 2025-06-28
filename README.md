# ChronicleTree

A full-stack family-tree web app  
– **Backend**: Ruby on Rails 8.0 API with Devise-JWT authentication  
– **Frontend**: React 19 (Vite + TailwindCSS) SPA

---

## Table of Contents

1. [Prerequisites](#prerequisites)  
2. [Getting Started](#getting-started)  
3. [Configuration](#configuration)  
4. [Database Setup](#database-setup)  
5. [Running the App](#running-the-app)  
6. [Authentication Flow](#authentication-flow)  
7. [API Endpoints](#api-endpoints)  
8. [Testing](#testing)  
9. [Contributing](#contributing)  
10. [License](#license)

---

## Prerequisites

- Ruby 3.3.7 + Bundler  
- Node.js ≥18 & npm (or Yarn)  
- PostgreSQL (or your chosen DB)  
- Git

## Getting Started

```bash
# Clone the monorepo
git clone https://github.com/Liolax/ChronicleTree.git
cd ChronicleTree

# Install backend gems
cd chronicle_tree_api
bundle install

# Install frontend deps (in another terminal)
cd ../chronicle_tree_client
npm install
