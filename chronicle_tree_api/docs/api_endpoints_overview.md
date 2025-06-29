# ChronicleTree API Endpoints

This document provides an overview of all available API endpoints, their purpose, and expected parameters. All endpoints are prefixed with `/api/v1`.

---

## Authentication (`/auth`)

Handles user registration, login, and logout using Devise and JWT.

| Method | Path                  | Controller#Action             | Purpose                               |
| :----- | :-------------------- | :---------------------------- | :------------------------------------ |
| `POST` | `/auth`               | `auth/registrations#create`   | Register a new user.                  |
| `POST` | `/auth/sign_in`       | `auth/sessions#create`        | Log in and receive a JWT.             |
| `DELETE`| `/auth/sign_out`      | `auth/sessions#destroy`       | Log out and revoke the current JWT.   |
| `POST` | `/auth/password`      | `auth/passwords#create`       | Request a password reset email.       |
| `PUT`  | `/auth/password`      | `auth/passwords#update`       | Update password using a reset token.  |

---

## User Profile (`/users`)

Endpoints for managing the currently authenticated user's profile.

| Method   | Path                 | Controller#Action       | Purpose                               |
| :------- | :------------------- | :---------------------- | :------------------------------------ |
| `GET`    | `/users/me`          | `users#show`            | Get the current user's profile.       |
| `PATCH/PUT`| `/users/me`          | `users#update`          | Update the user's name and email.     |
| `DELETE` | `/users/me`          | `users#destroy`         | Delete the current user's account.    |
| `PATCH`  | `/users/password`    | `users#update_password` | Change the current user's password.   |

---

## People (`/people`)

Core resource for managing individuals in the family tree.

| Method   | Path                 | Controller#Action       | Purpose                               |
| :------- | :------------------- | :---------------------- | :------------------------------------ |
| `GET`    | `/people`            | `people#index`          | List all people for the current user. |
| `POST`   | `/people`            | `people#create`         | Create a new person.                  |
| `GET`    | `/people/:id`        | `people#show`           | Get details for a specific person.    |
| `PATCH/PUT`| `/people/:id`        | `people#update`         | Update a person's details.            |
| `DELETE` | `/people/:id`        | `people#destroy`        | Delete a person.                      |
| `GET`    | `/people/:id/tree`   | `people#tree`           | Get family tree data for a person.    |
| `GET`    | `/people/:id/relatives`| `people#relatives`      | Get a list of a person's relatives.   |

---

## Relationships (`/relationships`)

Manages the connections between people.

| Method   | Path                 | Controller#Action       | Purpose                               |
| :------- | :------------------- | :---------------------- | :------------------------------------ |
| `POST`   | `/relationships`     | `relationships#create`  | Create a relationship between two people. |
| `DELETE` | `/relationships/:id` | `relationships#destroy` | Delete a relationship.                |

---

## Facts (`/people/:person_id/facts` and `/facts/:id`)

Manages key facts (e.g., birth, death) for a person.

| Method   | Path                 | Controller#Action       | Purpose                               |
| :------- | :------------------- | :---------------------- | :------------------------------------ |
| `GET`    | `/people/:person_id/facts` | `facts#index`     | List all facts for a person.          |
| `POST`   | `/people/:person_id/facts` | `facts#create`    | Create a new fact for a person.       |
| `PATCH/PUT`| `/facts/:id`         | `facts#update`          | Update a specific fact.               |
| `DELETE` | `/facts/:id`         | `facts#destroy`         | Delete a specific fact.               |

---

## Timeline Items (`/people/:person_id/timeline_items` and `/timeline_items/:id`)

Manages chronological events for a person.

| Method   | Path                 | Controller#Action       | Purpose                               |
| :------- | :------------------- | :---------------------- | :------------------------------------ |
| `GET`    | `/people/:person_id/timeline_items` | `timeline_items#index` | List all timeline items for a person. |
| `POST`   | `/people/:person_id/timeline_items` | `timeline_items#create`| Create a new timeline item.         |
| `PATCH/PUT`| `/timeline_items/:id`| `timeline_items#update`| Update a specific timeline item.      |
| `DELETE` | `/timeline_items/:id`| `timeline_items#destroy`| Delete a specific timeline item.      |

---

## Media (`/people/:person_id/media` and `/media/:id`)

Manages file uploads (photos, documents) attached to a person.

| Method   | Path                 | Controller#Action       | Purpose                               |
| :------- | :------------------- | :---------------------- | :------------------------------------ |
| `GET`    | `/people/:person_id/media` | `media#index`     | List all media for a person.          |
| `POST`   | `/people/:person_id/media` | `media#create`    | Upload a new media file for a person. |
| `DELETE` | `/media/:id`         | `media#destroy`         | Delete a specific media file.         |

---

## Conclusion

This document serves as a reference for all API endpoints. For implementation details, refer to the [Backend Development Roadmap](./development_roadmap.md). For authentication specifics, see the [Devise & JWT Setup](./devise_setup.md).
