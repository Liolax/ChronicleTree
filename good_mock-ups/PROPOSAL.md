# ChronicleTree: Your Family's Living Legacy

**Yuliia Smyshliakova, x24110922, x24110922@student.ncirl.ie**

**Higher Diploma in Science in Computing (HDWD_SEP24OL)**

**Web Development**

**06.06.2025**

---

## 1. Objectives

Our project, ChronicleTree, aims to develop an innovative and robust web application for comprehensive family tree creation, management, and secure storage. It addresses a significant need in today's interconnected world: empowering individuals to thoroughly explore and preserve their personal heritage － the unique stories, connections, and genealogical data that define a family's history. This pursuit is a compelling and fundamental aspect of human connection, forming the core basis for our innovative web application. Our core ambition is to move beyond existing digital solutions － often outdated or cumbersome － by simplifying genealogical exploration and enabling users to seamlessly share their unique family stories and visual trees publicly. We are keenly aware of the ethical considerations involved in publicly sharing personal data; therefore, ensuring user consent and robust data privacy will be paramount throughout development.

The fundamental problem ChronicleTree addresses is the absence of a truly modern, intuitive, and personalized platform for genealogical record-keeping. Existing tools frequently miss opportunities for rich data capture and dynamic visualization. ChronicleTree is designed to fill this gap by blending solid data management with an engaging, interactive user experience that profoundly centers on individual family member stories.

To bring this vision to life, our development will systematically follow key objectives: First, we'll deep-dive into Requirements Specification and Analysis, meticulously defining core features, functional requirements, and the technical blueprint, including how social media sharing will integrate. Next, in Design and Prototyping, we'll craft a user-centric UI/UX and a scalable database schema, carefully considering content generation for sharing. The Development and Integration phase will see us implement the Ruby on Rails backend for robust data management and API functionality (supporting shareable content), and build the React/JavaScript frontend with intuitive tools for social sharing, using free, open-source libraries. A Comprehensive Testing and Validation phase will ensure the application is reliable, performs optimally, and has a robust security posture, guaranteeing flawless and secure social media features. Finally, Project Documentation will be meticulously prepared, detailing the system's architecture and the social sharing process in the user manual, culminating in a Project Presentation and Pitch that highlights the innovative social sharing potential.

## 2. Background

An analysis of current digital solutions for family tree management － including platforms such as Ancestry.com, MyHeritage, and FamilySearch － reveals that while they offer vast databases and robust collaborative features, they consistently prioritize the breadth of historical records over the depth of individual profiles and comprehensive user customization. We have observed that users often report cluttered interfaces, complex navigation, and limited functionalities for genuinely personalizing family member information or easily sharing their discoveries. This is precisely where ChronicleTree is positioned to innovate: through a dual focus on robust, intuitive tree visualization AND rich, customizable individual profiles.

ChronicleTree directly addresses these identified shortcomings. Our paramount objective is to deliver an exceptional User Experience (UX) and enable detailed, nuanced data capture for every family member. We are specifically setting out to overcome several common challenges. Many existing platforms, for instance, exhibit visually dated interfaces that have not fully embraced modern web interactions, contributing significantly to user frustration and a less engaging experience. Furthermore, while basic biographical fields are typically present, the crucial ability to genuinely record nuanced details, significant anecdotes, or specific life events is often cumbersome, poorly integrated, or entirely absent. We also recognize that as family trees expand in complexity, they frequently become unwieldy and difficult to navigate; the vital capability to dynamically re-center the tree on any selected individual － to focus effectively on a specific branch or lineage － is consistently lacking or inadequately implemented in current solutions. Lastly, existing tools frequently limit users' ability to share their findings beyond the platform's confines, thereby missing crucial opportunities for broader social engagement and wider dissemination of heritage.

Our primary target audience for ChronicleTree is clearly defined. This includes individuals passionate about genealogy, who are dedicated researchers seeking a more organized, personalized, and interactive digital space to consolidate their findings. It also extends to families desiring collaboration, envisioning users who aim to build a shared family record, facilitating easy and secure contributions from multiple relatives while maintaining data integrity and accuracy. Finally, we cater to casual users documenting personal heritage, individuals seeking an intuitive and engaging method to preserve their immediate family's stories and connections without requiring expertise in complex genealogical software.

The core innovation of ChronicleTree will be its provision of rich, expandable individual profiles, empowering users to transcend basic names and dates. Each profile will feature a comprehensive, yet flexible, questionnaire structure. This structure will encompass core information such as names and years of life (with a 'present' option for living individuals to provide complete historical context), alongside contextual details like place of study and profession (with corresponding years) to add deeper layers to an individual's life story. A dedicated 'Notes' section will serve as a canvas for biographies, significant anecdotes, or major life events, actively encouraging rich, personal storytelling. A fundamental functional feature, Dynamic Tree Centering, will enable users to instantly re-center the entire family tree view on any selected family member, profoundly enhancing navigation and focus within even the largest, most intricate trees. Furthermore, we will include flexible options for adding custom fields or entirely new sections, accommodating the diverse information users may wish to record, and provide seamless media integration to attach photos, documents, or external links directly to each profile, thereby enriching the historical record and vividly bringing individual stories to life. A critical addition will be direct social media sharing capabilities, allowing users to effortlessly share visual representations of their family tree or intriguing profile facts on platforms like Facebook or X (formerly Twitter), directly from the application. This functionality extends the family's narrative beyond the immediate application, fostering a "living legacy" that can be shared with a broader network. It is important to note that this feature will be implemented utilizing free, open-source libraries or direct, cost-free API integrations.

By intently focusing on these distinct and innovative areas, ChronicleTree aims to deliver a significantly more engaging, personalized, and efficient family history management experience, thereby substantially differentiating itself in a market that stands to benefit from a fresh, user-centric perspective.

## 3. Technical Approach

As a solo endeavor, the ChronicleTree project will be executed using an Agile methodology. We believe this iterative development approach is perfectly suited for managing a single-developer workload effectively. It allows us to adapt flexibly to evolving requirements and ensures we have regular checkpoints for refinement throughout the project. Our development process is organized into distinct, yet interconnected, phases:

We're starting with the **Research and Planning Phase**. This involves thoroughly gathering requirements, analyzing existing genealogical software to understand the market, and meticulously defining our technology stack: Ruby on Rails for the backend and React/JavaScript for the frontend. We'll also complete the preliminary planning for the application's overall architecture, including the critical database schema design.

Next up is the **Design and Prototyping Phase**. Here, our main focus will be on creating detailed UI mockups and interactive prototypes. This is essential for visualizing and refining the user experience. Simultaneously, we'll precisely design the underlying database structure and comprehensively define the Application Programming Interfaces (APIs). These APIs are absolutely critical for smooth and efficient communication between our chosen Rails backend and React frontend.

The heart of the project is the **Development and Integration Phase**. This iterative stage will involve building both server-side and client-side components simultaneously. The Ruby on Rails backend will be developed to handle robust data management and API functionality, forming the secure foundation of the application. At the same time, the React and JavaScript frontend will be carefully crafted to create the rich, interactive, and intuitive user interface we envision. Throughout this phase, we'll regularly build and integrate code, conducting frequent internal testing to catch issues early and ensure everything works seamlessly.

A truly vital step is the **Testing and Quality Assurance Phase**. We'll use a systematic and multi-faceted approach to testing, including comprehensive unit tests, integration tests, and critical security testing (especially important for data integrity), alongside targeted penetration testing. Our main goal here is to rigorously confirm the application's stability, ensure optimal performance under various conditions, and establish a truly robust security posture against potential threats.

Then, there's the **Documentation Phase**. All necessary academic and technical documentation will be meticulously created in parallel with the development process, not as an afterthought. This guarantees accuracy and currency throughout the project's lifecycle and will include detailed specifications for both the Ruby on Rails backend and React frontend, plus user manuals and testing reports.

Finally, the **Project Presentation Phase** is when everything comes together. This involves meticulously preparing and professionally delivering the project pitch. This presentation is our chance to clearly showcase the application's innovation, dynamically demonstrate its core functionality, and convincingly explain its commercial viability to the assessment panel.

Throughout every stage of this project, we're putting a strong, unwavering emphasis on secure programming practices and strict adherence to security principles. This commitment is particularly vital given the responsibilities inherent in developing an application that handles sensitive personal information.

## 4. Special Resources Required

To bring the ChronicleTree project to a successful conclusion and ensure its quality, we'll definitely need access to some specific, carefully chosen resources. Crucially, every single tool and resource we use will be free and open-source, aligning perfectly with our student budget.

On the software side, we'll be utilizing industry-standard Integrated Development Environments (IDEs) like Visual Studio Code to write, debug, and manage our code efficiently. For robust data management, PostgreSQL is our chosen Database Management System － it's incredibly reliable. A solid Version Control System like Git, hosted on platform such as GitHub, will be absolutely essential for tracking changes, managing our project's evolving history, and facilitating systematic development. For a solo endeavor like ours, Git allows us to maintain a meticulous record of every change, experiment with new features on separate branches, and revert to previous states if necessary, ensuring a robust and well-organized project workflow. Sure, we’ll need modern web browsers like Chrome and Firefox for thorough cross-browser compatibility testing, making sure users have a consistent experience no matter what they use. We're also strongly considering Docker for containerization; while not strictly mandatory, its community edition would be highly beneficial for maintaining a consistent development environment and simplifying potential deployment later on.

When it comes to literature and research, we'll be relying on a variety of credible and freely accessible sources. This includes academic papers and industry articles, with a keen focus on secure web development practices, paying close attention to OWASP guidelines to inform our security measures. Naturally, we’ll be consulting the official documentation for Ruby on Rails, React, JavaScript, and any specific libraries or frameworks we end up utilizing. Furthermore, we'll be diving into textbooks and online resources on sound database design principles, best practices for API design, and modern web application architecture patterns to ensure a truly solid foundation. Lastly, understanding how to make the user experience intuitive is paramount, so we'll be researching best practices for UI and UX design, especially within data visualization applications where clarity is absolutely key.

As for hardware, a capable personal computer with sufficient processing power and Random Access Memory (RAM) will serve as our primary workstation, enabling efficient development, seamless local testing, and rapid iteration. And, of course, a stable and reliable internet connection is a fundamental necessity for development, and research.

## 5. Project Plan

This project plan outlines our approach to delivering a showcase project that demonstrates our ability as software/web developers. Our goal is to produce a commercially viable software tool that integrates a range of skills－from ideation and project management through to development, testing, and a final live presentation. Our plan is structured into key phases, each with explicit deadlines to ensure we remain on track.

**Phase 1: Conception & Planning**
*   **Deadline:** 7 June 2025, 11:55pm (Week 3)
*   At the outset, we will submit the Signed Project Brief, the Project Proposal (this document), and the NCI Ethics Approval Form by the deadline. During this phase, we will:
    *   Define the core functional requirements by writing detailed user stories (for example, for profiles and tree navigation).
    *   Conduct a thorough competitive analysis of existing family tree applications.
    *   Finalize our technology stack－Ruby on Rails, React, and PostgreSQL－and outline a preliminary database schema.
    *   Set up our core development environment for efficient coding.

**Phase 2: Requirements Specification & Prototyping**
*   **Deadline:** 21 June 2025, 11:55pm (Week 5)
*   In the Design & Prototyping phase, we will transition into detailed planning by:
    *   Creating comprehensive wireframes and UI mockups for both the main tree view and individual profile pages.
    *   Developing interactive prototypes to showcase key user flows, such as adding a new family member or dynamically centering the tree.
    *   Finalizing our detailed database schema while defining all necessary API endpoints to support seamless CRUD operations between the front-end and back-end.
*   This phase culminates with the submission of our Project Requirements Specification on 21 June 2025.

**Phase 3: Initial Development & Interim Reporting**
*   **Deadline:** 28 June 2025, 11:55pm (Week 6)
*   Once our blueprint is in place, we will begin the development process by:
    *   Implementing essential backend functionalities, including robust user authentication (via Devise in Rails) and developing API endpoints for managing family member data.
    *   Starting the front-end work by building initial React components, such as dynamic tree visualizations.
    *   Conducting early unit and integration testing to ensure that our foundational components work as expected.
*   The progress made during this phase will be documented in our Interim Progress Report, due on 28 June 2025. This report serves as a checkpoint to verify that we are on track.

**Phase 4: Analysis & Detailed Design Documentation**
*   **Deadline:** 19 July 2025, 11:55pm (Week 9)
*   After laying the groundwork, we will consolidate and refine our development outcomes by:
    *   Analyzing the results from our initial development and testing phases to refine the overall system architecture.
    *   Documenting detailed design decisions, including architectural refinements and improvements based on early feedback.
*   We will submit our comprehensive Project Analysis & Design Documentation on 19 July 2025, encapsulating the strategic direction and technical adjustments made thus far.

**Phase 5: Live Presentation**
*   **Dates:** 30 July & 6 August 2025 (Weeks 11 & 12)
*   To provide a dynamic demonstration of our work, we will deliver live presentations via Teams:
    *   These sessions will allow us to showcase the innovative features of our project and the seamless integration between the front-end and back-end.
    *   This is our opportunity to highlight the application’s functionality and demonstrate our effective project management.

**Phase 6: Final Submission**
*   **Deadline:** 9 August 2025, 11:55pm (Week 12)
*   In the final phase, we will present our polished project deliverables:
    *   A video demonstrating the complete and functional project.
    *   The finalized Project Report (which includes the Declaration Project Cover Sheet) detailing our design, development, testing processes, and reflections.
    *   The complete project code.
*   This final submission represents the culmination of our efforts, showcasing a robust, well-tested, and user-friendly software tool ready for real-world applications.

Throughout the project, we will adhere to robust secure programming practices and maintain detailed logs of all test plans－including functionality, unit, integration, and security tests. Our plan optimizes efficiency through overlapping tasks and an Agile approach, ensuring that every critical aspect is systematically addressed and that all deadlines are met.

By following this well-structured timeline, we will demonstrate not only our technical expertise but also our ability to deliver a commercially viable and academically rigorous software solution.

## 6. Technical Details

The ChronicleTree application will be built upon a modern and robust technology stack, a collection we’ve meticulously selected for its suitability in achieving our proposed objectives and ensuring we can deliver a high-quality, scalable, and secure application that truly stands out.

For the server-side, we’ve chosen **Ruby on Rails**. We're particularly drawn to Ruby for its rapid development capabilities and Rails’ famous "convention over configuration" philosophy, which genuinely speeds up the development process, along with its extensive ecosystem of powerful gems. Rails provides a robust Model-View-Controller (MVC) architecture, making data management, API development, and adhering to secure coding practices much simpler and more efficient. Its active community and comprehensive documentation will be an invaluable asset for a solo project like this, providing support and resources whenever needed. The rationale here is clear: Rails truly excels at building sophisticated web applications with complex data models, which makes it absolutely ideal for managing intricate family relationships and those detailed individual profiles we envision. Crucially, its built-in security features, like protection against Cross-Site Request Forgery (CSRF) and Cross-Site Scripting (XSS), align perfectly with the strong emphasis we’re placing on cybersecurity for this project.

On the client-side, we’ve selected **React powered by JavaScript**. React's component-based architecture is a huge plus because it promotes modularity, reusability, and highly efficient User Interface (UI) development. Its Virtual DOM significantly enhances performance by minimizing direct Document Object Model (DOM) manipulations, ultimately leading to a much smoother and more responsive user experience for the end-user. JavaScript, as the foundational language for React, will be utilized for all client-side scripting, managing interactive elements, and ensuring seamless Application Programming Interface (API) communication with our backend. The reason for choosing React is that it’s exceptionally well-suited for creating the dynamic and interactive user interfaces that are crucial for a powerful family tree visualization tool. Its efficiency in rendering complex UIs and managing application state will effectively provide that 'rich internet application interface' that the project brief calls for, bringing the family history to life.

For the database, **PostgreSQL** is our choice. It’s a powerful, open-source relational database management system (RDBMS) renowned for its reliability, extensive feature set, and strong support for complex data types and advanced indexing. PostgreSQL is highly suitable for storing the structured and interconnected genealogical data, ensuring data integrity, transactional consistency, and efficient querying of complex relationships within the family tree － which can grow very large! Its proven scalability will also effectively support future growth of user data and potential feature expansion, making it a robust foundation.

In terms of key libraries and plugins, while the exact list will be refined during development, here are some illustrative examples that are foundational to our approach, all of which are free and open-source:

*   For **Ruby on Rails**, we’ll definitely use **Devise** for robust user authentication and authorization, providing secure login and user management out-of-the-box. We’ll also utilize **ActiveModel Serializers** or **Jbuilder** for efficiently preparing JSON responses from the backend API, perfectly optimized for consumption by the React frontend.
*   On the **React** side, **React Router** is crucial for managing client-side routing within the single-page application structure, ensuring smooth navigation. A powerful visualization library like **D3.js** (or perhaps alternatives like **Konva.js** or **JointJS**) is absolutely essential for dynamically rendering and allowing interaction with complex family tree structures; this is critical for implementing that innovative 'centering on selected member' feature. Finally, **Axios** or the native **Fetch API** will be used for making asynchronous HTTP requests to the Rails API from the React application, facilitating data exchange. For social media integration, we will explore using free, client-side JavaScript SDKs provided by platforms like Facebook or X (formerly Twitter) to enable sharing functionalities without incurring additional costs.

This carefully chosen collection of technologies is highly compatible and represents a standard, modern full-stack web development paradigm. Rails will provide a robust API backend, while React will efficiently consume that API to create a dynamic and responsive frontend. PostgreSQL, meanwhile, is a common, highly performant, and perfectly compatible database choice for Rails applications. This integrated stack is exceptionally well-suited for delivering all our proposed objectives. Rails will ensure secure, persistent data storage and enable the implementation of complex server-side functionality. React will provide the dynamic graphical user interface and sophisticated client-side scripting. Together, these technologies will facilitate the development of a complex, high-quality application with an excellent user experience, thereby fulfilling all core project requirements. The presence of strong, active communities and extensive, well-maintained documentation for all these chosen technologies will also be a critical asset for us as solo developers, enabling independent problem-solving and continuous learning.

## 7. Evaluation

Our ChronicleTree system will undergo a truly rigorous evaluation against its stated objectives and technical requirements. We’ll be employing a comprehensive, multi-faceted assessment approach, encompassing both technical validation and valuable user-centric feedback, ensuring a holistic understanding of the application's success.

For the **Technical Evaluation**, we'll focus on three main, quantifiable areas:

*   **Functional Correctness:** We’ll measure this through the pass/fail rate of unit tests (using tools like RSpec for Ruby and Jest for React components) for individual modules and functions. Critically, we'll also track the pass/fail rate of integration tests (leveraging Capybara for Rails and React Testing Library for the frontend) to ensure all those critical end-to-end user flows work perfectly－things like "Successfully add a family member" or "Correctly display the tree centered on a selected individual," and importantly, the seamless sharing to social media platforms. Our automated test suites will run continuously as part of a CI/CD pipeline, and we’ll also perform manual feature verification to confirm every requirement in this proposal is met precisely.
*   **Performance Analysis:** This will be crucial to ensuring a smooth and responsive user experience. We intend to set clear, measurable metrics based on established industry standards for web application responsiveness. Specifically, the average response time for critical API calls, such as "Load family tree data" or "Fetch individual profile," needs to be under 500ms under normal load conditions. This threshold is widely recognized as the point at which user perception shifts from immediate response to a noticeable delay, impacting overall user satisfaction. For complex database queries like "Find all ancestors/descendants," we aim for an execution time under 100ms, reflecting the typical expectation for rapid data retrieval from optimized databases. Furthermore, on the client side, the rendering time for large tree structures (say, 500+ nodes) will need to be under 1.5 seconds to ensure a fluid visual experience without perceived lag, especially during interactive navigation. We will rigorously assess these performance targets using specialized profiling tools (such as Ruby's benchmark module and browser developer tools for the frontend) and dedicated load testing tools, including JMeter or Locust, to simulate system behavior with concurrent users.
*   **Security Posture:** This is paramount, especially for an application handling personal historical data. Our metrics here will be strict: the number of critical/high-severity vulnerabilities identified by static and dynamic code analysis tools (like Brakeman for Rails and OWASP ZAP for dynamic scanning) must be zero at deployment. We’ll also demonstrate rigorous adherence to OWASP Top 10 security principles, verified through both manual and automated penetration testing. Our evaluation will involve integrating regular security scans into the development workflow. We’ll also perform manual penetration testing to identify any logical flaws or misconfigurations, and every single identified vulnerability will be promptly remediated before deployment.

Beyond the technical side, there will be an **End-User Evaluation**, which will be qualitative in nature.

While this isn't a formal human-participant research study, we will certainly employ a usability testing approach. This will involve continuous self-assessment during development, followed by collecting informal feedback from a small, controlled group of beta users－perhaps some peers or family members who can offer genuine insights. Our focus areas for this feedback will include:

*   **The Intuitiveness of the UI/UX:** We’ll ask users to complete key tasks like "Add a new relative," "Navigate through the tree," "Edit a profile," and, crucially, "Center the tree on a specific person" to assess how easy it is to use without prior instruction. We'll also gather feedback on the ease and clarity of the social media sharing process.
*   **The Completeness of Profile Options:** We'll specifically seek feedback on how relevant and useful the questionnaire fields are, and how flexible the custom sections feel for capturing diverse information.
*   **The Clarity of Tree Visualization:** Users will be encouraged to comment on how readable and navigable the dynamic family tree is, ensuring it effectively conveys complex relationships. We'll gather this feedback through direct observation during these informal sessions and via structured qualitative questions (for instance, asking "On a scale of 1-5, how intuitive was adding a new family member?") to pinpoint any areas where we can further improve usability and refine the feature design.

Finally, to assess how well we've achieved our **Overall Project Objectives**, each proposed objective, along with the project's key outcomes, will be evaluated against specific criteria:

*   **LO1 (Project Specification, Design, Implementation, Testing, Documentation):** This will be unequivocally achieved by the successful completion and delivery of a fully functional ChronicleTree application that robustly meets all specified requirements, supported by comprehensive academic and technical documentation, and clear evidence of rigorous testing.
*   **LO2 (Technology Justification):** This will be achieved through the detailed rationale provided in Section 6 (Technical Details), justifying our choice of Ruby on Rails and React/JavaScript, and demonstrating their effective and integrated application in meeting the project's complex requirements.
*   **LO3 (Communication and Presentation Skills):** This will be achieved through the creation of this professional project proposal, the detailed academic documentation that accompanies the project, and the final project pitch and presentation, demonstrating clear articulation of technical concepts and project outcomes.
*   **Innovation:** This will be assessed by the successful implementation of the 'dynamic tree centering' and 'rich, customizable individual profiles with questionnaire' features, which we believe truly showcase a novel approach that goes beyond what’s typically seen in standard genealogical applications, alongside the direct social media sharing capability.
*   **Commercial Viability:** This will be assessed by the application's ability to provide a superior user experience and feature set compared to current competitors, clearly indicating strong market potential and a viable product concept, especially given its focus on free tools.
*   **Completeness:** This will be evaluated by the readiness of the application for potential commercial implementation, signifying a polished, well-tested, and deployable product.

---
_Yuliia Smyshliakova, 06.06.2025_