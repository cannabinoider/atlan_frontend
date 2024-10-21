GoodPort

This logistics platform enables users to transport goods between locations with real-time tracking, driver assignment, and secure payment processing. The platform provides a smooth and efficient user experience, with built-in geolocation, route mapping, and analytics.

Tech Stack
Frontend: Next.js, React, Material-UI (MUI), Tailwind CSS  
Backend: Node.js, Express.js  
Database: PostgreSQL  
Geolocation & Routing: GraphHopper API  
Visualization: React Leaflet, Chart.js  

Deployment & Setup  
Frontend Repository: https://github.com/cannabinoider/atlan_frontend  
Backend Repository: https://github.com/cannabinoider/goodport_backend  
*env files will be required, if you want to try ask through email.*  

All the users except admin can be created  
Admin Access  
Username: atlan_admin  
Password: atlanadmin  
![WhatsApp Image 2024-10-18 at 21 33 48_90bc7347](https://github.com/user-attachments/assets/2bfb6fea-902e-4ed4-8f03-d18b3144073a)

Key Features  ![WhatsApp Image 2024-10-18 at 21 45 56_3f843c6c](https://github.com/user-attachments/assets/2837bb75-f4f9-41b8-9d53-a953f2b7fb1b)

1.User Account Creation and Security  

Users can create and manage accounts with encrypted passwords.  
Secure login ensures sensitive information is stored safely in the PostgreSQL database.  
Booking System  

2.Users can book transportation services by providing:  
Goods Type (perishable/non-perishable)  
Vehicle Type (light, medium, heavy)  
Weight of the goods  
Pickup and Drop Locations (geocoded via GraphHopper API)  
A cost estimate is generated based on the weight, vehicle type, goods type, and distance.  

3.Geolocation and Route Mapping  
GraphHopper API geocodes the pickup and dropoff locations and maps the route.  
React Leaflet visualizes the route on an interactive map, giving users real-time insights.  

4.Payment System  

Users make payments based on cost estimates calculated from goods weight, vehicle type, and distance.  
The payment must be confirmed before booking.  

5.Driver Dashboard  

Drivers can view and accept available bookings.  
All relevant details (pickup, dropoff, user info) are displayed.  
Driver location is updated every 10 minutes, relayed to users for real-time tracking.  
Booking status is updated during delivery (e.g., "In Transit", "Delivered").  

6.Admin Panel  

Admins can manage vehicles, drivers, and booking data.  
Provides detailed insights using Chart.js for analytics and graphical reports.  

7.Analytics and Graphical Insights  

Donut Charts for vehicle usage and goods type distribution.  
Line Graph visualizing profit trends over time.  
Helps admins make data-driven decisions about operations and resources.  

8.Real-Time Status and Tracking  

Users track their goods in real-time once the driver accepts the booking.  
Drivers update the delivery status at each stage, notifying users.  

9.Backend and Middleware  

Node.js and Express handle user authentication, booking logic, and data handling.  
Secure middleware ensures proper access control.  
GraphHopper API is optimized to minimize redundant API calls by storing routes.  

10.Database Optimization  

PostgreSQL handles real-time updates efficiently, storing user info, bookings, and route data.  

Future Enhancements  
Users and drivers can view their previous bookings.  
Drivers can select deliveries based on their preferences.  
Support for delayed bookings where users schedule pickups for future dates.  
Drivers can bundle multiple deliveries on a single route.  
Full integration of actual payment gateway.  

Getting Started  
To start the development server, navigate to your project directory and run:  
npm install  
npm run dev  


![Screenshot 2024-10-19 181032](https://github.com/user-attachments/assets/6521105c-419d-4ac5-ae53-a72c55146966)
![Screenshot 2024-10-19 180945](https://github.com/user-attachments/assets/a9f751ef-f1ef-45a5-9272-f49482c8a4be)
![Screenshot 2024-10-19 181138](https://github.com/user-attachments/assets/cbad4497-c2cc-4dd1-aa98-3380627678d8)
![Screenshot 2024-10-19 181102](https://github.com/user-attachments/assets/04f22f05-8615-49f6-a18c-a4609a5356bb)
