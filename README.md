# flyingclubreservations

**Flying Club App Project Summary**
**Purpose**

The app aims to streamline airplane reservation management, compliance tracking, and club operations for a small flying club with 25 members and 3 airplanes. It enhances member convenience, ensures safety through compliance checks, and empowers board members with administrative control, all while maintaining a professional and mobile-friendly interface.

**End Goal**

Deliver a fully functional web application hosted on Cloudflare, enabling members to reserve airplanes, manage profiles, and view contact info, while providing board members with tools to oversee reservations, compliance, maintenance, and squawk tracking. The initial launch will serve as a prototype, with analytics added later, and future iterations may include broader notifications.

**Environment**

Platform: Cloudflare (Workers for backend, Pages for frontend, D1 for database), with direct development (no local setup) and a staging environment.
Frontend: ReactJS with FullCalendar for the calendar, styled to match a user-provided screenshot (no glowing accents), deployed on Cloudflare Pages.
Backend: Cloudflare Workers using JavaScript, integrated with Auth0 (free tier) for user authentication and SendGrid (free tier) for optional cancellation emails.
Database: Cloudflare D1 with SQL tables for users, airplanes, reservations, maintenance, and squawks.
Features and Functions

**User Features:**
**Login:** Secure authentication via Auth0.
**Reservations:** Add, modify, or delete personal reservations up to the event end time via a calendar (selectable slots) or a separate link. View all reservations with user contact info (name, email, phone).
**Profile Management:** Edit personal details (name, email, phone) and view compliance status (read-only).
**Cancellation:** Cancel reservations with an optional checkbox to notify club members via email (SendGrid).

**Compliance Tracking:**
Monitor medical, FAA flight review (every 2 years), and club flight review (every 1 year) expiries.
Restrict expired users to local “flight review” reservations, visible only when expired.

**Board Member Features:**
**Admin Control:** Add, modify, or delete any reservation (up to event end time), update user compliance, and manage profiles.
Maintenance Schedules: Add date/time ranges with notes to block reservations, viewable on the calendar.
**Squawks:** Add indefinite out-of-service issues with notes, resolve them with resolution notes, and track history.
**History:** Access historical records of maintenance and squawks.

**Shared Features:**
**Calendar View:** Display reservations, maintenance schedules, and squawk statuses (e.g., warnings for out-of-service airplanes).

