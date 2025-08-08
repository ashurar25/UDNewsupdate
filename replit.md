# Overview

This is a Thai news aggregation web application called "อัพเดทข่าวอุดร - UD News Update" that automatically collects and displays news articles from multiple RSS sources including Matichon, TNN, and Honekrasae. The application provides real-time news updates with a clean, mobile-responsive interface designed specifically for Thai users.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript and follows a component-based architecture:

- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **UI Components**: shadcn/ui component library built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom Thai-themed color palette and typography
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a modern React patterns with custom hooks, context providers, and reusable UI components. The application is designed mobile-first with responsive layouts and Thai language support using Google Fonts (Noto Sans Thai and Inter).

## Backend Architecture
The backend is a Node.js Express server designed for RSS feed aggregation:

- **Framework**: Express.js with TypeScript
- **Data Access**: Currently uses in-memory storage with an interface-based design for easy database migration
- **RSS Processing**: Custom RSS parser that extracts articles from XML feeds
- **API Design**: RESTful endpoints for news articles and RSS source management
- **Development Setup**: Vite middleware integration for seamless full-stack development

The server implements a storage abstraction layer through the IStorage interface, currently backed by MemStorage but designed to easily swap to database implementations.

## Data Storage Solutions
The application uses a dual approach for data persistence:

- **Current**: In-memory storage (MemStorage class) for development and testing
- **Configured**: PostgreSQL with Drizzle ORM for production deployment
- **Schema**: Well-defined database schemas for news articles and RSS sources with proper indexing and constraints
- **Migration**: Drizzle Kit for database schema management and migrations

The database schema includes tables for news articles (with title, content, source, publication date) and RSS sources (with URL, status tracking, and activity flags).

## Authentication and Authorization
Currently, the application operates without user authentication as it's designed as a public news aggregation service. The architecture supports future authentication implementation through middleware patterns already established in the Express server.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: PostgreSQL session store for future session management

## UI and Styling
- **shadcn/ui**: Pre-built accessible UI components
- **Radix UI**: Headless UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom Thai theming
- **Lucide React**: Icon library for consistent iconography

## Data Fetching and Management
- **TanStack Query**: Server state management, caching, and synchronization
- **date-fns**: Date manipulation and formatting with Thai locale support
- **Zod**: Runtime type validation for API responses and form data

## RSS and Content Processing
- **Native Fetch API**: RSS feed retrieval from external sources
- **Custom XML Parser**: Built-in RSS parsing without external XML dependencies
- **Multiple News Sources**: Integration with Matichon, TNN, and Honekrasae RSS feeds

## Development and Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking across the entire stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimizations for Replit platform

## News Sources Integration
The application integrates with three major Thai news sources:
- **Matichon**: `https://www.matichon.co.th/rss/news`
- **TNN Thailand**: `https://www.tnnthailand.com/rss.xml`  
- **Honekrasae**: `https://www.honekrasae.com/rss`

Each source is monitored for status (online/offline/error) with automatic retry mechanisms and user-visible status indicators.