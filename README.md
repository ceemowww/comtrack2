# ComTrack

A company relationship tracking application built with React TypeScript frontend and Node.js TypeScript backend.

## Quick Start

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Initialize database:**
   ```bash
   npm run init-db
   ```

3. **Development (runs both frontend and backend):**
   ```bash
   npm run dev
   ```

4. **Production build and start:**
   ```bash
   npm run build
   npm start
   ```

## Features

- Company workspace selection
- Customer management (B2B)
- Supplier management (B2B)
- Modern UI with Tailwind CSS and shadcn/ui

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, TypeScript, PostgreSQL
- **Database:** PostgreSQL

## Scripts

- `npm run dev` - Start development servers (frontend + backend)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run init-db` - Initialize database with demo data

## Database Setup

Make sure PostgreSQL is running and update the `.env` file in the `server` directory with your database URL.