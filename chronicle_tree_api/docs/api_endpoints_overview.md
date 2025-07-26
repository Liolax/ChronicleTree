
# ChronicleTree API Endpoints (Actual)

This document provides a live, up-to-date overview of all available API endpoints, their purpose, and expected parameters. All endpoints are prefixed with `/api/v1` and match the current Rails API implementation.

---


## Authentication (`/api/v1/auth`)
Handles user registration, login, and logout using Devise and JWT. All authentication endpoints are implemented via Devise controllers and use JWT for stateless auth.

| Method   | Path                         | Controller#Action             | Purpose                               |
| :------- | :--------------------------- | :---------------------------- | :------------------------------------ |
| `POST`   | `/api/v1/auth`               | `auth/registrations#create`   | Register a new user.                  |
| `POST`   | `/api/v1/auth/sign_in`       | `auth/sessions#create`        | Log in and receive a JWT.             |
| `DELETE` | `/api/v1/auth/sign_out`      | `auth/sessions#destroy`       | Log out and revoke the current JWT.   |
| `POST`   | `/api/v1/auth/password`      | `auth/passwords#create`       | Request a password reset email.       |
| `PUT`    | `/api/v1/auth/password`      | `auth/passwords#update`       | Update password using a reset token.  |

---


## User Profile (`/api/v1/users`)
Endpoints for managing the currently authenticated user's profile. All actions are scoped to the logged-in user and require authentication.

| Method     | Path                          | Controller#Action       | Purpose                               |
| :--------- | :---------------------------- | :---------------------- | :------------------------------------ |
| `GET`      | `/api/v1/users/me`            | `users#show`            | Get the current user's profile.       |
| `PATCH/PUT`| `/api/v1/users/me`            | `users#update`          | Update the user's name and email.     |
| `DELETE`   | `/api/v1/users/me`            | `users#destroy`         | Delete the current user's account.    |
| `PATCH`    | `/api/v1/users/password`      | `users#update_password` | Change the current user's password.   |

---


## People (`/api/v1/people`)
Core resource for managing individuals in the family tree. All people are scoped to the current user.

| Method     | Path                                   | Controller#Action       | Purpose                               |
| :--------- | :------------------------------------- | :---------------------- | :------------------------------------ |
| `GET`      | `/api/v1/people`                       | `people#index`          | List all people for the current user. |
| `POST`     | `/api/v1/people`                       | `people#create`         | Create a new person.                  |
| `GET`      | `/api/v1/people/:id`                   | `people#show`           | Get details for a specific person.    |
| `PATCH/PUT`| `/api/v1/people/:id`                   | `people#update`         | Update a person's details.            |
| `DELETE`   | `/api/v1/people/:id`                   | `people#destroy`        | Delete a person.                      |
| `GET`      | `/api/v1/people/:id/tree`              | `people#tree`           | Get family tree data for a person.    |
| `GET`      | `/api/v1/people/:id/full_tree`         | `people#full_tree`      | Get the full tree and all profile data for a person. |
| `GET`      | `/api/v1/people/:id/relatives`         | `people#relatives`      | Get a list of a person's relatives.   |

---


## Notes (`/api/v1/people/:person_id/note` and `/api/v1/notes/:id`)
Manages a single note per person. Each person can have at most one note.

| Method     | Path                                         | Controller#Action       | Purpose                               |
| :--------- | :------------------------------------------- | :---------------------- | :------------------------------------ |
| `GET`      | `/api/v1/people/:person_id/note`             | `notes#show`            | Get the note for a person.            |
| `POST`     | `/api/v1/people/:person_id/note`             | `notes#create`          | Create a note for a person.           |
| `PATCH/PUT`| `/api/v1/notes/:id`                          | `notes#update`          | Update a person's note.               |
| `DELETE`   | `/api/v1/notes/:id`                          | `notes#destroy`         | Delete a person's note.               |

---


## Relationships (`/api/v1/relationships`)
Manages the connections between people (parent, spouse, sibling, etc.).

| Method     | Path                          | Controller#Action       | Purpose                               |
| :--------- | :---------------------------- | :---------------------- | :------------------------------------ |
| `POST`     | `/api/v1/relationships`       | `relationships#create`  | Create a relationship between two people. |
| `DELETE`   | `/api/v1/relationships/:id`   | `relationships#destroy` | Delete a relationship.                |

---


## Facts (`/api/v1/people/:person_id/facts` and `/api/v1/facts/:id`)
Manages key facts (e.g., birth, death) for a person. Facts are attached to people and can be created, updated, or deleted.

| Method     | Path                                         | Controller#Action       | Purpose                               |
| :--------- | :------------------------------------------- | :---------------------- | :------------------------------------ |
| `GET`      | `/api/v1/people/:person_id/facts`            | `facts#index`           | List all facts for a person.          |
| `POST`     | `/api/v1/people/:person_id/facts`            | `facts#create`          | Create a new fact for a person.       |
| `PATCH/PUT`| `/api/v1/facts/:id`                          | `facts#update`          | Update a specific fact.               |
| `DELETE`   | `/api/v1/facts/:id`                          | `facts#destroy`         | Delete a specific fact.               |

---


## Timeline Items (`/api/v1/people/:person_id/timeline_items` and `/api/v1/timeline_items/:id`)
Manages chronological events for a person. Timeline items are attached to people and can be created, updated, or deleted.

| Method     | Path                                         | Controller#Action       | Purpose                               |
| :--------- | :------------------------------------------- | :---------------------- | :------------------------------------ |
| `GET`      | `/api/v1/people/:person_id/timeline_items`   | `timeline_items#index`  | List all timeline items for a person. |
| `POST`     | `/api/v1/people/:person_id/timeline_items`   | `timeline_items#create` | Create a new timeline item.           |
| `PATCH/PUT`| `/api/v1/timeline_items/:id`                 | `timeline_items#update` | Update a specific timeline item.      |
| `DELETE`   | `/api/v1/timeline_items/:id`                 | `timeline_items#destroy`| Delete a specific timeline item.      |

---


## Media (`/api/v1/people/:person_id/media` and `/api/v1/media/:id`)
Manages file uploads (photos, documents) attached to a person. Media files are stored and associated with people.

| Method     | Path                                         | Controller#Action       | Purpose                               |
| :--------- | :------------------------------------------- | :---------------------- | :------------------------------------ |
| `GET`      | `/api/v1/people/:person_id/media`            | `media#index`           | List all media for a person.          |
| `POST`     | `/api/v1/people/:person_id/media`            | `media#create`          | Upload a new media file for a person. |
| `DELETE`   | `/api/v1/media/:id`                          | `media#destroy`         | Delete a specific media file.         |

---


## Conclusion

This document is a live reference for all API endpoints in the ChronicleTree Rails API. All endpoints are implemented and up to date as of July 2025. For implementation details, see the [Project Roadmap](../../ROADMAP.md). For authentication specifics, see the [Devise & JWT Setup](./devise_setup.md).
