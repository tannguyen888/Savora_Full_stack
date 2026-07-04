# Savora

Savora is a recipe management and meal planning application that helps users organize recipes, plan weekly meals, and generate recipes using AI from text descriptions or fridge images.

---

## Overview

Savora provides the following core features:

- Recipe management system for storing and organizing recipes
- Weekly meal planning interface
- AI-powered recipe generation from text input
- Ingredient recognition from fridge images with recipe suggestions

---

## Screenshots

<p align="center">
  <img src="https://github.com/user-attachments/assets/3781a5e3-2296-43cb-b5f6-79363672fba2" width="30%" />
  <img src="https://github.com/user-attachments/assets/6d6372a3-5c0f-4fe9-8835-10af98b35a58" width="30%" />
  <img src="https://github.com/user-attachments/assets/36a9bd12-3505-402b-925f-7a1f2548ddd0" width="30%" />
</p>

---

## Features

- Recipe creation and management
- Weekly meal planning
- AI-based recipe generation from text input
- Fridge image analysis for ingredient detection
- Recipe suggestions based on available ingredients
- Search and filter recipes
- Save favorite recipes

---

## Architecture

### Frontend
- React
- Axios
- React Router

### Backend
- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- PostgreSQL / MySQL

---

## Project Structure


savora/
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── backend/
│   ├── src/main/java
│   ├── src/main/resources
│   └── pom.xml
│
└── README.md


---

## Getting Started

### Clone repository


git clone https://github.com/your-username/savora.git
cd savora




### Backend setup


cd backend
mvn spring-boot:run


Backend runs at:


http://localhost:8080




### Frontend setup


cd frontend
npm install
npm start


Frontend runs at:


http://localhost:3000


---

## API Example

### Generate recipe


POST /api/recipes/generate


Request:

json
{
  "prompt": "chicken, rice, and garlic"
}


Response:
json
{
  "title": "Garlic Chicken Rice",
  "ingredients": ["chicken", "rice", "garlic"],
  "instructions": "..."
}


---

## AI Features

- Convert text descriptions into structured recipes
- Detect ingredients from images
- Suggest recipes based on available ingredients

---

## Roadmap

- Mobile application
- Nutrition tracking system
- Grocery list generation
- Voice input support
- Multi-language support

---

## License
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=fff)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)
