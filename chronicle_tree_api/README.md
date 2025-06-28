# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

# API Endpoints Overview

The following is a summary of the available API endpoints. All endpoints are prefixed with `/api/v1`.

| Resource        | HTTP Verb(s)              | Path                               | Action                               |
|-----------------|---------------------------|------------------------------------|--------------------------------------|
| **Auth**        |                           |                                    |                                      |
|                 | `POST`                    | `/auth`                            | User registration (sign up)          |
|                 | `POST`                    | `/auth/sign_in`                    | User session creation (sign in)      |
|                 | `DELETE`                  | `/auth/sign_out`                   | User session destruction (sign out)  |
|                 | `POST`                    | `/auth/password`                   | Request password reset               |
|                 | `PUT`/`PATCH`             | `/auth/password`                   | Change password with reset token     |
| **Users**       |                           |                                    |                                      |
|                 | `GET`                     | `/users/me`                        | Get current user's profile           |
|                 | `PUT`/`PATCH`             | `/users/me`                        | Update current user's profile        |
|                 | `DELETE`                  | `/users/me`                        | Delete current user's account        |
|                 | `PATCH`                   | `/users/me/password`               | Change current user's password       |
| **People**      |                           |                                    |                                      |
|                 | `GET`, `POST`             | `/people`                          | List people, Create a new person     |
|                 | `GET`                     | `/people/:id`                      | Get a specific person                |
|                 | `PUT`/`PATCH`             | `/people/:id`                      | Update a specific person             |
|                 | `DELETE`                  | `/people/:id`                      | Delete a specific person             |
|                 | `GET`                     | `/people/:id/tree`                 | Get a person's tree                  |
|                 | `GET`                     | `/people/:id/relatives`           | Get a person's relatives              |
| **Facts**       |                           |                                    |                                      |
|                 | `GET`                     | `/people/:person_id/facts`        | List all facts for a person          |
|                 | `POST`                    | `/people/:person_id/facts`        | Create a new fact for a person       |
|                 | `PATCH`/`DELETE`         | `/facts/:id`                       | Update or delete a specific fact     |
| **TimelineItems**|                          |                                    |                                      |
|                 | `GET`                     | `/people/:person_id/timeline_items`| List all timeline items for a person |
|                 | `POST`                    | `/people/:person_id/timeline_items`| Create a new timeline item for a person|
|                 | `PATCH`/`DELETE`         | `/timeline_items/:id`              | Update or delete a specific timeline item|
| **Media**       |                           |                                    |                                      |
|                 | `GET`                     | `/people/:person_id/media`        | List all media for a person          |
|                 | `POST`                    | `/people/:person_id/media`        | Upload new media for a person        |
|                 | `DELETE`                  | `/media/:id`                       | Delete a specific media              |
| **Relationships**|                          |                                    |                                      |
|                 | `POST`                    | `/relationships`                   | Create a new relationship            |
|                 | `DELETE`                  | `/relationships/:id`               | Delete a specific relationship       |
|                 | `DELETE`                  | `/relationships/:id`               | Delete a specific relationship       |
