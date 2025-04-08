# Realtime Chat App

## Description

A real-time chat application with a frontend built using **Next.js**, **Tailwind CSS**, **Material UI (MUI)**, and a backend powered by **NestJS** and **MongoDB**. This project supports basic chat functionality and can be extended with **Cloudinary** for image storage and **Kafka** for chat support in the future.

## Technologies Used

- **Frontend:**

  - Next.js (App Router)
  - Tailwind CSS
  - Material UI (MUI)

- **Backend:**
  - NestJS
  - MongoDB (for storing user and message data)
- **Planned Technologies:**
  - **Cloudinary** (for image storage)
  - **Kafka** (for enhanced chat functionality)

## Setup

### 1. Frontend Setup

To run the frontend of the project, navigate to the frontend directory and install the required dependencies:

```bash
cd client
npm install
```

After installation, run the app:

```bash
npm run dev
```

The frontend will run at `http://localhost:1234`.

### 2. Backend Setup

To run the backend, navigate to the backend directory and install the required dependencies:

```bash
cd server
npm install
```

Then, run the NestJS application:

```bash
npm run start
```

The backend will run at `http://localhost:6789`.

### 3. MongoDB Setup

Ensure you have MongoDB installed or use a cloud-based MongoDB service (e.g., MongoDB Atlas). Configure the MongoDB connection in the `.env` file of the backend.

### 4. Environment Configuration

Create a `.env` file in both the frontend and backend directories to configure necessary values:

#### Frontend `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:6789
```

#### Backend `.env`:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:1234
```

## Running the Application

After installing dependencies and configuring the environment variables, you can start both the frontend and backend to test the application.

Frontend will run at: `http://localhost:1234`

Backend will run at: `http://localhost:6789`

## Features

- User registration/login
- Real-time messaging
- Integration of user images (planned for Cloudinary)
- Storing and managing messages in MongoDB

## Future Features

- **Kafka** will be integrated for enhanced chat scalability and performance.
- **Cloudinary** will be used for storing and displaying user images.

## Tools and Libraries

- **ExpressJS** (used within NestJS)
- **MongoDB** (database)
- **JWT** (user authentication)
- **Bcrypt** (password hashing)
- **Nodemailer** (email functionality)
- **Cloudinary** (image storage)
- **Kafka** (future chat support)

## Acknowledgments

Thank you for checking out this project. Stay tuned for future updates that will bring new features and improvements!
