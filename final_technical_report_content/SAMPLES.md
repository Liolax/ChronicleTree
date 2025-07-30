HARDWARE ARCHITECTURE
The app once finished will be hosted on AWS, providing robust, scalable, and
flexible infrastructure for deployment and management.
The client and server components will be deployed on the same AWS instance to
streamline communication and improve performance. When a user navigates to
the application's URL, the client-side application will be downloaded and executed
on the user's device. Client requests for data will be sent to the server, which will
respond with JSON data that updates the user's view in real-time.
The client side, developed with React, will be fully responsive and capable of
running on any device with a modern web browser, including desktops, tablets,
and smartphones. This ensures a consistent and user-friendly experience across
different devices.
Server: The application will be hosted on AWS. Client: Users will access the
application via web browsers on their desktops, tablets, or smartphones.
AWS provides the necessary infrastructure to ensure high performance, scalability,
and reliability for the pp.

3.2Hardware Architecture
The hardware architecture of ForkGuide is designed to ensure good performance and scalability, meaning that if it is decided to bring this project to the market, it will support high usability well, but it needs to go through tests to prove this.
The backend of ForkGuide uses a setup that includes efficient processors and adequate memory to enhance the application's performance. Efficient processors and sufficient memory ensure that the Node.js application with Express.js can handle multiple user requests simultaneously without loss of performance. As the MongoDB Atlas database is hosted in the cloud, the storage infrastructure is managed by the cloud service provider, which uses advanced technologies to ensure fast and reliable data access. This allows data to be retrieved and stored quickly, providing a fast and reliable user experience. This infrastructure meets current needs and is prepared to support future growth and increased user demand.
Furthermore, the architecture includes features for high availability and fault tolerance. Load balancers distribute incoming traffic across multiple servers, preventing any single server from becoming a bottleneck. MongoDB's replication features ensure data redundancy and availability, allowing user data and other critical information to be managed efficiently. By leveraging cloud infrastructure, high-performance hardware, and robust database management systems, ForkGuide ensures optimal performance and reliability for its users. This comprehensive hardware architecture not only improves the user experience but also provides a scalable solution for the application's growth and functional needs.
To prove the effectiveness of this architecture, it would be interesting to conduct load and performance tests in the future if the project is published, as already mentioned. Load tests with tools like JMeter or Artillery can simulate many simultaneous users to measure system performance. Performance tests specific to MongoDB operations can be conducted to compare response times with and without the use of SSDs. Additionally, real-time monitoring with tools like New Relic or Datadog can provide data on CPU usage, memory, and disk performance, demonstrating the stability and efficiency of the infrastructure. Although these tests are not necessary now for the purpose of the final project, they are recommended to validate and optimize the application in a production environment.

3.2 Hardware Architecture

The application is being designed to incorporate into an existing CRM solution that utilizes ANPR cameras to capture vehicle and their number plates.
The application will replace the existing FTP server used to upload ANPR images. It has been developed in node.js/express.js which allows it the flexibility of running in any node.js supported operating system to ensure easy integration into an existing CRM application regardless of the hardware and/or operating systems being used.
The infrastructure to support the camera connectivity back to the FTP server is assumed to be already in place.
End users would have a corporate desktop/laptop with a modern operating system such as Windows 11. 
As the application front end, will utilizes bootstrap it is require the client device has internet connectivity with a modern web browser such as Edge or Chrome.

