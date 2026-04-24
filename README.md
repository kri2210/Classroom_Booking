# College Booking App

The **College Booking App** is a comprehensive, full-stack web application built to streamline the reservation and management of institutional resources. It provides a centralized platform for college staff, faculty, and administrators to seamlessly browse, book, and manage classrooms, laboratories, and auditoriums. 

By eliminating the friction of manual booking systems, the application ensures transparent resource allocation, prevents double-booking, and synchronizes dynamically with existing university timetables. It features a robust role-based access control (RBAC) system with tailored dashboards for Administrators, Heads of Departments (HODs), and Faculty members, ensuring a secure and organized workflow.

## Project Structure
- `frontend/`: React frontend built with Vite.
- `backend/`: Node.js and Express backend.

## Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (Node Package Manager)
- **Supabase** account (for database and authentication)

## Setup Instructions

### 1. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Create a `.env` file in the `backend` directory and configure your Supabase credentials:
  
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Features
- **Resource Booking**: Seamlessly book classrooms, labs, and auditoriums.
- **Role-based Access Control**: Different dashboards and permissions for Admin, HOD, and Faculty.
- **Timetable Synchronization**: Automatically parse and populate slots via Excel file uploads.

