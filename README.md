Flying Club Reservations App

A web application for managing airplane reservations and pilot qualifications for a small flying club with 25 members and 3 airplanes.

Setup

Hosted on Cloudflare Pages with a ReactJS frontend.

Backend uses Cloudflare Workers and D1 for database.

Authentication via Auth0 (free tier).

Email notifications via SendGrid (free tier).


Development

Push changes to the main branch to trigger automatic deploys on Cloudflare Pages.

Build command: npm run build

Build output directory: build


Next Steps

Set up Cloudflare D1 database.

Integrate Auth0 for authentication.

Implement reservation system backend.