# Sproutly

Sproutly is a smart plant tracker web application that helps users manage their plants, explore plant care information, receive watering reminders, and get weather-based watering suggestions.

The project is built as a separated frontend and backend system:
- Frontend: HTML5, CSS3, JavaScript
- Backend: Java with Spring Boot
- Communication: HTTP with asynchronous AJAX requests
- External services: OpenWeather API and Trefle API

## Overview

Sproutly is designed for plant lovers who want a simple and modern way to keep track of plant care routines. The application allows users to add plants, store useful information, check care guidelines, and make smarter watering decisions with the help of weather data.

This project follows a full-stack architecture with a clear separation between frontend and backend responsibilities.

## Features

- Add and manage plants
- Store plant name, type, photo, notes, and location
- View plant care guidelines
- Get weather-based watering suggestions
- Mobile-friendly dashboard
- Guest mode for quick testing
- User authentication
- Responsive interface for desktop and mobile

## Project goals

This project is designed to satisfy the main system requirements:

- Separate frontend and backend components
- HTTP communication between frontend and backend
- AJAX requests for asynchronous updates
- REST endpoints using GET, POST, PUT, DELETE, and PATCH
- Session-based authentication and login flow
- Integration of external REST APIs
- Responsive design
- Structured and maintainable project architecture

## Tech stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES modules)

### Backend
- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- H2 or PostgreSQL/MySQL

### External APIs
- OpenWeather API
- Trefle API

## Repository structure

```text
sproutly/
├── backend/
│   ├── src/main/java/com/sproutly/
│   ├── src/main/resources/
│   └── pom.xml
├── frontend/
│   ├── index.html
│   ├── admin.html
│   ├── components/
│   ├── js/
│   └── css/
└── README.md
```

## Frontend structure

```text
frontend/
├── index.html
├── admin.html
├── components/
│   ├── welcome-screen.js
│   └── dashboard-screen.js
├── js/
│   ├── app.js
│   ├── admin.js
│   ├── api.js
│   ├── auth.js
│   ├── forms.js
│   ├── features.js
│   ├── state.js
│   └── ui.js
└── css/
    ├── tokens.css
    ├── base.css
    ├── layout.css
    ├── components.css
    ├── plant-illustration.css
    └── styles.css
```

## Backend structure

```text
backend/
└── src/main/java/com/sproutly/
    ├── config/
    ├── controller/
    ├── entity/
    ├── repository/
    ├── service/
    └── SproutlyApplication.java
```

## Main endpoints

### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`

### Plants
- GET `/api/plants`
- POST `/api/plants`
- DELETE `/api/plants/{id}`
- PATCH `/api/plants/{id}/water`

### Weather and care
- GET `/api/weather?city=Vienna`
- GET `/api/care-guide?plant=Monstera`

## Running the project

### Backend
1. Open the `backend/` folder in IntelliJ IDEA or VS Code.
2. Configure the database in `application.properties` if needed.
3. Add API keys later if you connect real weather and plant services.
4. Start the Spring Boot application.

Run with:

```bash
cd backend
mvn spring-boot:run
```

### Frontend
1. Open the `frontend/` folder.
2. Start a local static server.
3. Open the app in your browser.

Example:

```bash
cd frontend
npm start
```

Then open:

- `http://localhost:5500`
- `http://localhost:5500/admin.html`

## Environment variables

Recommended backend configuration for future extension:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `OPENWEATHER_API_KEY`
- `TREFLE_API_KEY`
- `JWT_SECRET`

## Notes

- Guest mode allows quick testing without storing data in the database.
- Logged-in users can manage persistent plant data.
- The frontend is split into reusable modules for maintainability.
- The backend is organized by configuration, controller, entity, repository, and service layers.
- The project can start with mocked API responses and later be extended with real external API integrations.

## Authors

BugBytes