# ChronicleTree

A full-stack family tree web application

- **Backend:** Ruby on Rails 8 API (JWT authentication, RESTful, PostgreSQL)
- **Frontend:** React 19 (Vite, TailwindCSS, Zustand, React Flow)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Running the App](#running-the-app)
4. [API Overview](#api-overview)
5. [Authentication Flow](#authentication-flow)
6. [Testing](#testing)
7. [Contributing](#contributing)
8. [License](#license)

---

## Prerequisites

- Ruby 3.3+
- Node.js 18+
- PostgreSQL
- Git

## Getting Started

```bash
# Clone the repo
$ git clone https://github.com/Liolax/ChronicleTree.git
$ cd ChronicleTree

# Install backend dependencies
$ cd chronicle_tree_api
$ bundle install

# Install frontend dependencies (in a new terminal)
$ cd ../chronicle_tree_client
$ npm install
```

## Running the App

1. **Start Rails API**
   ```bash
   cd chronicle_tree_api
   bin/rails s
   # API: http://localhost:3000
   ```
2. **Start React Client**
   ```bash
   cd chronicle_tree_client
   npm run dev
   # Client: http://localhost:5173
   ```

---

## API Overview

All endpoints are prefixed with `/api/v1`. See `chronicle_tree_api/docs/api_endpoints_overview.md` for full details.

### Authentication

- `POST   /api/v1/auth` — Register
- `POST   /api/v1/auth/sign_in` — Login (returns JWT)
- `DELETE /api/v1/auth/sign_out` — Logout

### User Profile

- `GET    /api/v1/users/me` — Get current user
- `PATCH  /api/v1/users/me` — Update user
- `DELETE /api/v1/users/me` — Delete user

### People

- `GET    /api/v1/people` — List people
- `POST   /api/v1/people` — Create person
- `GET    /api/v1/people/:id` — Get person
- `PATCH  /api/v1/people/:id` — Update person
- `DELETE /api/v1/people/:id` — Delete person
- `GET    /api/v1/people/:id/tree` — Get tree for person
- `GET    /api/v1/people/:id/full_tree` — Get full tree
- `GET    /api/v1/people/:id/relatives` — Get relatives

### Relationships

- `POST   /api/v1/relationships` — Create relationship
- `DELETE /api/v1/relationships/:id` — Delete relationship

### Notes

- `GET    /api/v1/people/:person_id/note` — Get note
- `POST   /api/v1/people/:person_id/note` — Create note
- `PATCH  /api/v1/notes/:id` — Update note
- `DELETE /api/v1/notes/:id` — Delete note

### Facts

- `GET    /api/v1/people/:person_id/facts` — List facts
- `POST   /api/v1/people/:person_id/facts` — Create fact
- `PATCH  /api/v1/facts/:id` — Update fact
- `DELETE /api/v1/facts/:id` — Delete fact

### Timeline Items

- `GET    /api/v1/people/:person_id/timeline_items` — List timeline items
- `POST   /api/v1/people/:person_id/timeline_items` — Create timeline item
- `PATCH  /api/v1/timeline_items/:id` — Update timeline item
- `DELETE /api/v1/timeline_items/:id` — Delete timeline item

### Media

- `GET    /api/v1/people/:person_id/media` — List media
- `POST   /api/v1/people/:person_id/media` — Upload media
- `DELETE /api/v1/media/:id` — Delete media

## Validation Rules

ChronicleTree enforces strict validation rules to ensure realistic and legal family relationships:

### Marriage
- Minimum marriage age: **16 years** for both people
- Birth dates required for marriage validation
- Blood relatives cannot marry (parent/child, grandparent/grandchild, siblings, uncle/aunt-nephew/niece, first cousins)
- Cannot marry if already has a current spouse (unless divorced or widowed)
- Deceased people cannot be added as new spouses

### Parent-Child
- Parent must be at least **12 years older** than child
- No more than **2 parents** per person
- Blood relatives cannot be added as parents or children
- Deceased parent cannot have children born after their death

### Siblings
- Siblings must share at least one biological parent or have parents married to each other (step-siblings)
- Siblings must be in the same generation (no ancestor/descendant as sibling)
- Maximum **25-year age gap** between siblings
- Timeline validation: siblings cannot exist if one died before the other was born

### Step-Relationships
- Step-relationships (step-parent, step-grandparent, step-sibling, etc.) only created through direct marriage
- Timeline validation: step-relationships blocked if connecting spouse/parent died before the target person was born
- Ex-spouses do not create step-relationships

### Media
- Supported file types: JPG, PNG, GIF
- Maximum file size: **2MB**

### General
- All birth and death dates must be in chronological order
- All relationships must respect biological reality and legal constraints
- Clear, user-friendly validation alerts are shown for all errors

See the application for specific error messages and validation feedback.

## Authentication Flow

- Register or log in to receive a JWT token.
- Pass the JWT as an `Authorization: Bearer <token>` header for all API requests.
- Log out to revoke the token.

---

## Testing

- **Backend:**
  - Run Rails tests: `bin/rails test`
- **Frontend:**
  - Run Vitest: `npm run test`

---

## Contributing

1. Fork the repo and create a feature branch.
2. Make your changes and add tests.
3. Open a pull request with a clear description.

---

## License

MIT

