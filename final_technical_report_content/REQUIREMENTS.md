# HDSSD Requirements Specification (RS) - ChronicleTree

**Author:** Yuliia Smyshliakova  
**Date:** 21/06/2025

---

## Document Control

### Revision History

| Date        | Version | Scope of Activity                              | Prepared               | Reviewed | Approved |
|-------------|---------|-----------------------------------------------|------------------------|----------|----------|
| 10/06/2025  | 1.0     | Initial version of the document.              | Yuliia Smyshliakova    |          |          |
| 17/06/2025  | 1.1     | Aligned document with official HDSSD RS.      | Yuliia Smyshliakova    |          |          |
| 21/06/2025  | 1.2     | Final version with all functional requirements explicitly detailed. | Yuliia Smyshliakova |          |          |

---

### Distribution List

| Name                | Title     | Version |
|---------------------|-----------|---------|
| Hamilton Niculescu  | Lecturer  |         |

---

### Related Documents

| Title                   | Comments                                                                          |
|-------------------------|-----------------------------------------------------------------------------------|
| Project Proposal.docx   | The primary document describing the project's goals, objectives, and technical approach. |
| Title of Use Case Model |                                                                                   |
| Title of Use Case Description |                                                                             |

---

## Table of Contents

- 1.Introduction ......................................................…....….......….. 3.
- 1.1 Purpose ........................................................................….... 3.
- 1.2 Project Scope ............................................................…....... 3.
- 1.3 Definitions, Acronyms, and Abbreviations ......................... 4.
- 2.User Requirements Definition ........................................…....... 4.
- 3.Requirements Specification ...........................................…........ 5.
- 3.1 Functional Requirements ......................................…........... 5.
- 3.1.1 Use Case Diagram ..............................................…........... 5.
- 3.1.2 Requirement 1: User Authentication ..................…...…... 6.
- 3.1.3 Requirement 2: Account Settings Management ....……... 7.
- 3.1.4 Requirement 3: Family Tree Management .............…..... 8.
- 3.1.5 Requirement 4: Rich Profile Management ...........…........ 9.
- 3.1.6 Requirement 5: Tree Visualization and Navigation ….... 11.
- 3.1.7 Requirement 6: Social Media Sharing ...................…...... 12.
- 3.2 Non-Functional Requirements ........................................... 13.
- 3.2.1 Performance/Response time requirement .........…......... 13.
- 3.2.2 Availability requirement .....................................…......... 13.
- 3.2.3 Recoverability requirement ..................................…....... 13.
- 3.2.4 Robustness requirement ......................................…........ 13.
- 3.2.5 Security requirement .............................................…....... 13.
- 3.2.6 Reliability requirement .........................................…........ 14.
- 3.2.7 Maintainability requirement ..........................…............... 14.
- 3.2.8 Portability requirement ................................…................ 14.
- 3.2.9 Extendibility requirement ............................…................ 14.
- 3.2.10 Reusability requirement ...................................….......... 14.
- 3.2.11 Resource utilization requirement ...................…............ 14.
- 4.GUI .............................................................................……........ 14.
- 5.System Architecture ..................................................……......... 22.
- 5.1 High-level Component Diagram ........................................ 22.
- 5.2 Class Diagram (for data model) ...........................…........... 23.
- 6.System Evolution ...................................................…...……...... 23.

---

## 1. Introduction
This document presents the formal Requirements Specification for the ChronicleTree web application. As a foundational document in the software development lifecycle, this RS provides a comprehensive and authoritative description of the system's intended functionality, features, and constraints. It is designed to serve as a definitive guide for the project's developer, ensuring that the final product aligns precisely with the established objectives and user expectations. The primary audience for this document is the project's lecturer and assessors, but it also informs the evaluation process by providing clear, verifiable criteria for success.
### 1.1 Purpose
The purpose of this RS is to provide a detailed and unambiguous definition of the functional and non-functional requirements for the ChronicleTree application. It will act as the primary reference for all subsequent project phases, including system design, implementation, and quality assurance testing. By formally documenting the project scope and features, this RS ensures a shared understanding of the system to be built and establishes a baseline for all development and evaluation activities. It outlines what the system will do, how it will perform, and the user experience it intends to provide.
### 1.2 Project Scope
The scope of this project encompasses the design and development of a full-stack web-based application that allows users to create, visualize, and manage their family history. The primary motivation for this endeavor stems from an identified gap in the current market for genealogical software; existing tools often prioritize vast data collection over a rich, user-centric experience. ChronicleTree aims to address this by providing an intuitive platform that emphasizes detailed, personal storytelling alongside robust data management. The core functionality includes robust user authentication, intuitive family tree visualization, comprehensive profile management for individuals, and the ability to add diverse media to profiles.
●Project Objectives & Success Conditions:
○Objective 1: Deliver a secure user authentication and account management system.
■Success Condition: A user can successfully register, log in, manage their credentials (email/password), and is restricted from accessing other users' data.
○Objective 2: Implement full CRUD functionality for family members and their rich, editable profiles.
■Success Condition: All CRUD operations for family members, their media, and their detailed custom profile fields function as specified and are reflected accurately in the database.
○Objective 3: Create a dynamic, interactive, and intuitive tree visualization with seamless sharing capabilities.
■Success Condition: The family tree renders correctly, the "Dynamic Centering" feature operates smoothly, and both tree and profile views can be successfully shared via the social media workflow.
●Out of Scope for this Version:
○Advanced collaboration features for multiple users editing the same tree simultaneously.
○GEDCOM import/export functionality.
○Mobile native applications.
○Integration with external genealogical databases.
●Project Risks and Contingency Plan:
○Risks: The primary risk stems from the project being a solo endeavor, creating a dependency on a single person's availability and time management. Additionally, performance issues could arise due to inefficient database queries or frontend rendering, impacting user experience. Scope creep also poses a challenge, potentially leading to delays and resource strain.
○Contingency: A detailed project plan with clear, achievable milestones has been established. The scope is tightly controlled to focus on core features first. To mitigate performance issues, database queries and frontend rendering are optimized for responsiveness. Strict change control measures are in place to prevent scope creep, ensuring that only high-priority features are implemented.
### 1.3 Definitions, Acronyms, and Abbreviations
| Term    | Definition |
|---------|------------|
| User    | The primary actor, a registered member of the application. |
| RS      | Requirements Specification |
| API     | Application Programming Interface |
| CRUD    | Create, Read, Update, Delete |
| GUI     | Graphical User Interface |
| OWASP   | Open Web Application Security Project, a non-profit foundation that works to improve software security. |
| SVG     | Scalable Vector Graphics, used for drawing tree lines. |
| UI/UX   | User Interface / User Experience, referring to the design and overall experience of the application. |
| GEDCOM  | Genealogical Data Communication, a de facto standard for exchanging genealogical data between different genealogy software. |
| MVC     | Model-View-Controller, a software architectural pattern for implementing user interfaces. |
| SPA     | Single-Page Application, a web app that interacts with the user by dynamically rewriting the current page. |

---

## 2. User Requirements Definition
The primary users of ChronicleTree are individuals interested in documenting and exploring their family history. They range from casual enthusiasts to dedicated genealogists. From the perspective of the end-user, there is a clear need for a simple and visually appealing way to build and navigate their family tree. Users require the ability to store a wide range of information about each family member, including personal details, life events, stories, and various media. Furthermore, as family trees grow in size and complexity, users require an intuitive method for navigating these intricate structures without feeling overwhelmed. Users expect their sensitive family data to be securely stored and protected with appropriate privacy controls. Finally, there is a demand for a seamless integration with modern social platforms, allowing users to easily share their discoveries and family stories with a wider network of friends and relatives.

---

## 3. Requirements Specification
This section translates the previously defined user requirements into a set of specific, verifiable functional requirements. Each requirement details a core capability that the system must provide to the user, ranked in order of priority for development.
### 3.1 Functional Requirements
#### 3.1.1 Use Case Diagram (Overall)
A Use Case diagram provides a high-level visual overview of the system's functional requirements and how the user interacts with them. The central actor is the "User," who can perform several key actions: Authenticate (Register/Login), Manage Family Tree, Manage Rich Profiles, View Tree, and Share to Social Media. Each use case corresponds to a major feature set of the application.
This diagram depicts the "User" actor and all the main use cases described in sections 3.1.2 through 3.1.7, showing their relationships and interactions, and providing a quick overview of system functionality from the user's perspective.
#### 3.1.2 Requirement 1: User Authentication
●Description & Priority: High priority. Essential for securing user data and personalizing the experience.
●Scope: Secure user registration, login, and session management.
●Flow Description:
○Precondition: User is not authenticated.
○Activation: The User navigates to the application's login/registration page.
○Main flow (Login):
1.The User enters their email and password and clicks "Login".
2.The system validates the credentials against the database.
3.Upon successful validation, the system establishes a secure user session.
4.The User is redirected to their main family tree view.
○Alternate flow (Registration - A1):
1.The User clicks "Register" on the login page.
2.The User provides a unique email, password, and confirms the password.
3.The system validates the input (e.g., email format, password strength, unique email).
4.Upon successful validation, a new user account is created in the database.
5.The User is automatically logged in and redirected to the main family tree view.
○Alternate flow (Forgot Password - A2):
1.The User clicks "Forgot Password".
2.The User enters their registered email address.
3.The system sends a password reset link to the provided email.
4.The User clicks the link, navigates to a reset page, enters and confirms a new password.
5.The system updates the password and logs the user in.
○Alternate flow (Invalid Credentials - A3):
1.If login credentials are invalid, the system displays an error message ("Invalid email or password").
○Post condition: The User is either successfully authenticated and accessing the application, or informed of an error.
#### 3.1.3 Requirement 2: Account Settings Management
●Description & Priority: Medium priority. Important for user personalization and account security.
●Scope: Managing user account settings, including password changes and account deletion.
●Flow Description:
○Precondition: The User is authenticated.
○Activation: The User navigates to the account settings page.
○Main flow (Changing Password):
1.The User enters their current password, new password, and password confirmation.
2.The system validates the input (e.g., password strength, matching confirmation).
3.Upon successful validation, the system updates the user's password.
4.The User is notified of the successful password change.
○Main flow (Deleting Account):
1.The User clicks "Delete Account" on the settings page.
2.The system prompts for confirmation and the user's password.
3.Upon confirmation, the user account and all associated data are permanently deleted.
4.The User is logged out and redirected to the home page.
○Post condition: The user's account settings are updated, or the account is deleted as per the user's action.
#### 3.1.4 Requirement 3: Family Tree Management
●Description & Priority: High priority. This is the core functionality for visualizing family relationships.
●Scope: Creating, viewing, and modifying individuals and their relationships within a graphical family tree.
●Flow Description:
○Precondition: The User is authenticated.
○Activation: The User accesses the main application page or navigates to the family tree view.
○Main flow (Adding a Person):
1.The User clicks an "Add Person" button (e.g., on a central node or a plus icon next to an existing person).
2.A modal appears, allowing the User to input basic details (Name, Birth Date, Death Date, etc.).
3.The User can define relationships to existing people (e.g., parent, child, spouse) during creation or later.
4.The system saves the new person and updates the family tree visualization.
○Main flow (Editing Relationships):
1.The User selects two existing people.
2.The User clicks "Add Relationship" and chooses the type (e.g., Parent/Child, Spouse).
3.The system updates the relationship in the database and the tree view.
○Main flow (Navigating the Tree):
1.The User can pan and zoom the tree view.
2.Clicking on a "Person Card" reveals basic details and options to "View Profile" or "Edit".
○Alternate flow (Deleting a Person - A1):
1.The User selects a person and clicks "Delete".
2.The system prompts for confirmation.
3.Upon confirmation, the person and all associated relationships are removed.
○Post condition: The family tree accurately reflects the added, edited, or deleted individuals and relationships.
#### 3.1.5 Requirement 4: Rich Profile Management
●Description & Priority: High priority. Allows for the detailed storytelling that defines the application.
●Scope: Enriching a person's profile with detailed questionnaire data, notes, and media.
●Flow Description:
○Precondition: The User is authenticated and viewing either the main tree or a specific profile page.
○Activation: The User navigates to a profile page to view or edit details.
○Main flow (Editing Profile):
1.From the "Person Card" on the main tree, the User clicks "View Profile" to navigate to the dedicated profile page.
2.On the profile page, the User can edit information using granular controls:
■Profile Picture: The User can hover on the profile picture, which reveals an "edit" icon. Clicking this opens a modal allowing them to upload a new image, select an existing one from the gallery, or remove the picture entirely.
■Key Facts: The user can click the "Add Fact" button to open a modal for adding new key-value pairs (facts) with optional dates and locations. These facts are displayed directly on the profile's left column.
■Life Timeline: The User can click "Edit" on the timeline section to enter an editing mode. In this mode, they can delete existing milestones or add new ones. The "Add Milestone" modal allows for a title, a single date or a date range, a place, a description, and an icon. Clicking "Save" persists the changes.
■Notes: User clicks "Edit Notes", which converts the notes paragraph into a textarea for direct editing. Clicking "Save" persists the changes.
■Media: The User clicks the "+ Add Media" button, which opens the "Add Media" modal. The User can upload an image or document. The system saves the changes to the database and updates the profile page view instantly.
○Alternate flow (Removing Media - A1):
1.The User hovers over an image or document in the "Media Gallery".
2.A delete icon (e.g., a red 'x') appears on the media item.
3.The User clicks the delete icon.
4.The system prompts for confirmation. Upon confirmation, the media item is removed from the database and the gallery view is updated.
○Post condition: The person's profile in the database is enriched with new data.
#### 3.1.6 Requirement 5: Tree Visualization and Navigation
Description & Priority: High priority. This requirement describes the innovative visualization feature that is central to the user experience, allowing for intuitive navigation of complex family trees.
●Scope: Interaction with the visual representation of the family tree.
●Flow Description:
○Precondition: The User's family tree is loaded and displayed.
○Activation: The User interacts with a person's node in the tree.
○Main flow (Dynamic Centering):
1.The User clicks on a relative's node in the tree diagram.
2.The system smoothly pans and zooms the view, redrawing the tree to place the selected person in the center of the viewport.
3.Simultaneously, the system displays a "Person Card" pop-up next to the newly centered node, showing a brief summary (name, dates) and action buttons ("View Profile", "Edit", "Delete").
○Post condition: The tree visualization is updated to focus on the selected branch, and the user is presented with immediate options for that person.
#### 3.1.7 Requirement 6: Social Media Sharing
Description & Priority: Medium priority. Enables users to share their heritage.
●Scope: Exporting content to external social media platforms.
●Flow Description:
○Precondition: The User is viewing content they wish to share (e.g., the main tree view or a specific profile).
○Activation: The User clicks the "Share Tree" button in the header of the main tree view or the "Share Profile" button in the profile view.
○Main flow:
1.Clicking "Share Tree"/"Share Profile" navigates the user to the sharing options page.
2.The system presents sharing options (e.g., "Share to Facebook", "Share to X").
3.The system opens a modal that generates a preview of the shareable content (e.g., an image of the current tree view).
4.The User adds an optional caption and clicks "Confirm Share".
5.The system opens the standard sharing dialog of the selected social network, pre-filled with the generated image and text. (See E1)
6.The User confirms the post within the social network's native dialog box.
○Exceptional flow (User Cancel - E1):
1.The User cancels the post at any stage (e.g., closes the share modal or the social network's dialog).
2.The use case terminates without sharing content.
○Post condition: The content is published on the User's chosen social media profile.
### 3.2 Non-Functional Requirements
#### 3.2.1 Performance/Response time requirement
The system shall be highly responsive. The user login process shall be completed in under 3 seconds, and critical API calls, such as loading a family tree or an individual's profile, shall have an average response time of less than 500 milliseconds.
#### 3.2.2 Availability requirement
The application shall be available 24/7, with the exception of planned technical maintenance, accessible via modern web browsers. Detail: Target 99.9% uptime, with scheduled maintenance communicated.
#### 3.2.3 Recoverability requirement
In the event of a system failure, data must be recoverable from regular database backups to prevent loss. Detail: Daily backups will allow recovery to within 1 hour of data loss.
#### 3.2.4 Robustness requirement
The system should handle errors gracefully, provide clear feedback to the user, and operate stably under normal usage. Detail: User-friendly errors, critical error logging, and prevention of crashes from invalid input.
#### 3.2.5 Security requirement
The system shall be developed with a strong emphasis on security. It must protect against common web vulnerabilities as defined by the OWASP Top 10, and all user passwords shall be securely hashed before being stored. Detail: HTTPS for data, rigorous input validation, and secure session management.
#### 3.2.6 Reliability requirement
To ensure data integrity, the system shall use database transactions for all operations that involve multiple steps of data modification. Detail: Data consistency will be maintained across related operations.
#### 3.2.7 Maintainability requirement
The application code shall be well-structured and clearly commented, following the conventions of the chosen frameworks to facilitate future maintenance and bug fixes. Detail: Code will adhere to best practices for Ruby on Rails and React, including modular design and clear naming.
#### 3.2.8 Portability requirement
As a web application, the system will be accessible on any operating system with a modern browser. The use of containerization (e.g., Docker) will be considered to ensure environment consistency. Detail: Compatibility with recent major browsers. Docker for consistent development/deployment.
#### 3.2.9 Extendibility requirement
The system's architecture shall be designed in a modular fashion to allow for the future addition of new features without requiring a major architectural redesign. Detail: Clear separation of concerns and well-defined API will support future additions.
#### 3.2.10 Reusability requirement
The frontend will be built using a component-based architecture (React), promoting the reuse of UI elements across the application to ensure a consistent user experience and efficient development. Detail: Common UI components designed for reusability.
#### 3.2.11 Resource utilization requirement
The application will be optimized to be lightweight and efficient, minimizing client-side and server-side resource consumption to ensure a smooth experience even for users with less powerful hardware or slower internet connections. Detail: Optimized frontend assets and backend queries for efficiency.

---

## 4. Graphical User Interface (GUI)
The Graphical User Interface (GUI) will be meticulously designed to provide a clean, intuitive, and seamless user journey. The design process will follow a mobile-first philosophy to ensure a consistent and accessible experience across all devices. The user's interaction with the system will flow logically through a series of interconnected screens, each designed to fulfill specific functional requirements. For instance, a new user's journey begins at the Login/Registration Page, which directly implements the flow described in Requirement 1. Upon successful login, the user is welcomed to the main Tree Page (Requirement 5), the central hub for interacting with Requirement 3 and Requirement 6. From any individual's node on the tree, the user can navigate to the detailed Profile Page, the primary interface for Requirement 4. This ensures a clear and traceable path from a system requirement to its visual implementation.
The following mock-ups provide a visual representation of the key screens and user interactions within the ChronicleTree application:

---

## 5. System Architecture
The ChronicleTree app will adhere to a modern web application architecture, separating frontend and backend concerns. This architectural choice involves a clear separation of concerns between the server-side logic and the client-side presentation. The backend will be implemented using Ruby on Rails, following the Model-View-Controller (MVC) pattern, while the frontend will be a dynamic, component-based single-page application built with React. PostgreSQL was selected as the relational database for its robustness and reliability. This stack was chosen for its rapid development capabilities, strong community support, and robust features for building complex, data-centric applications. Both diagrams below illustrate the key components of the system and their interactions.
### 5.1 High-level Component Diagram 
Showing how the React frontend interacts with the Ruby on Rails backend API, which in turn interacts with the PostgreSQL database. This also includes external services like social media APIs.
### 5.2 Class Diagram (for data model) 
It shows the main entities (e.g., User, Person, Relationship, Profile, Media) and their attributes and relationships, focusing on data structure.

---

## 6. System Evolution
This project is designed with future growth in mind. The chosen architecture is inherently scalable and will support the evolution of the system over time. Possible future enhancements that have been considered include the implementation of advanced multi-user collaboration tools, the integration of data import/export features using standard genealogical formats like GEDCOM, and the development of a dedicated, native mobile application for an enhanced mobile experience.