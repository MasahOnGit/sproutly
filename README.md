# Sproutly 🌱

Sproutly is a smart plant tracking web application that helps users manage their plants, identify unknown plants, explore plant information, and receive weather-based watering recommendations.

The application is built as a full-stack web project with a clear separation between frontend and backend components.

---

# Architecture

## Frontend

* HTML5
* CSS3
* JavaScript (ES Modules)

## Backend

* Java 17
* Spring Boot
* Spring Web
* Spring Data JPA
* Spring Security

## Database

* H2 Database

## Communication

* HTTP
* AJAX (Asynchronous JavaScript and XML)
* REST API
* JSON and XML responses

---

# External APIs

## Open-Meteo API

Used for:

* Weather forecasts
* Weather-based watering suggestions

## PlantNet API

Used for:

* Plant identification from uploaded images

## Perenual API

Used for:

* Common plant names
* Scientific plant names
* Plant images

## GBIF API

Used for:

* Plant taxonomy
* Plant family information

---

# Features

## Plant Management

* Add plants
* Delete plants
* Edit plants
* Store plant information
* Track watering dates
* Save notes

## Plant Identification

* Upload a plant image
* Identify plant species using PlantNet
* Display identification results

## Plant Information

* Retrieve common plant names
* Retrieve scientific plant names
* Retrieve plant family information
* Display plant images

## Weather Integration

* Weather forecasts
* Weather-based watering recommendations

## User Management

* User registration
* User login
* User logout
* JWT authentication
* Guest mode

## Responsive Design

* Desktop support
* Tablet support
* Mobile support

---

# Project Goals

This project fulfills the following requirements:

* Separate frontend and backend components
* HTTP communication between frontend and backend
* AJAX communication
* REST architecture
* JSON responses
* XML responses
* Authentication and authorization
* External API integration
* Responsive design
* Structured and maintainable architecture

---

# Technology Stack

## Frontend

* HTML5
* CSS3
* JavaScript

## Backend

* Java
* Spring Boot
* Spring Security
* Spring Data JPA

## Database

* H2 Database

---

# Repository Structure

```text
sproutly/
├── backend/
├── frontend/
└── README.md
```

---

# Backend Structure

```text
backend/
└── src/main/java/com/sproutly/
    ├── config/
    ├── controller/
    ├── entity/
    ├── repository/
    └── SproutlyApplication.java
```

---

# Frontend Structure

```text
frontend/
├── index.html
├── admin.html
├── components/
├── js/
└── css/
```

---

# REST API Endpoints

## Authentication

### Register User

```http
POST /api/auth/register
```

### Login User

```http
POST /api/auth/login
```

### Logout User

```http
POST /api/auth/logout
```

---

## Plants

### Get All Plants

```http
GET /api/plants
```

### Create Plant

```http
POST /api/plants
```

### Delete Plant

```http
DELETE /api/plants/{id}
```

### Edit Plant

```http
PUT /api/plants/{id}
```
### Mark Plant as Watered

```http
PATCH /api/plants/{id}/water
```

---

## Plant Identification

### Identify Plant

```http
POST /api/identify-plant
```

Uses the PlantNet API to identify plants from uploaded images.

---

## Weather

### Weather Information

```http
GET /api/weather
```

Returns weather information from the Open-Meteo API.

---

## Plant Information

### Plant Details

```http
GET /api/care-guide?plant=Monstera
```

Returns:

```json
{
  "query": "Monstera",
  "commonName": "Monstera",
  "scientificName": "Monstera deliciosa",
  "family": "Araceae",
  "image": "...",
  "source": "Perenual + GBIF"
}
```

---

# Response Formats

The backend supports content negotiation and can return both JSON and XML.

JSON:

```http
Accept: application/json
```

XML:

```http
Accept: application/xml
```

Example:

```bash
curl -H "Accept: application/xml" \
"http://localhost:8080/api/care-guide?plant=basil"
```

---

# Running the Project

## Backend

```bash
cd backend
mvn spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

---

## Frontend

```bash
cd frontend
npm install
npm start
```

Frontend URL:

```text
http://localhost:3000
```

---

# Configuration

Configure API keys inside:

```text
backend/src/main/resources/application.properties
```

Example:

```properties
PLANTNET_API_KEY=
PERENUAL_API_KEY=
JWT_SECRET=
```

---

# Security

The application uses Spring Security and JWT authentication.

Features:

* User authentication
* JWT token generation
* Protected API endpoints
* Secure access control

---

# Authors

**BugBytes**
