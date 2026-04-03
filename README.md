# JagaJanin Backend

JagaJanin Backend adalah layanan backend untuk aplikasi JagaJanin, yang dirancang untuk mendukung pengelolaan data kehamilan, autentikasi pengguna, serta fitur konsultasi dan monitoring.

---

## Technology Stack

- Fastify (Web Framework)
- PostgreSQL (Relational Database)
- Drizzle ORM
- JSON Web Token (JWT) for Authentication
- Google OAuth 2.0
- Supabase Storage for File Management
- Docker (optional for containerization)

---

## Features

- User authentication using JWT (access token and refresh token)
- Google OAuth integration for user login
- User management
- Profile and image handling via Supabase Storage
- Consultation scheduling and management
- Pregnancy tracking (weekly progression, trimester calculation)
- Modular and maintainable code structure

---

## File Storage

- User profile images are stored using Supabase Storage
- Public bucket is used for profile images
- File URLs are generated using the Supabase public URL mechanism

---

## Architecture Notes

- Business logic is handled within the service layer
- HTTP request handling is managed by Fastify controllers
- Database interactions are managed using Drizzle ORM
- The codebase follows a modular and maintainable structure

---

## Future Improvements

- Refresh token rotation and enhanced security
- Background job processing (cron-based tasks)
- Notification system
- Extended analytics and reporting
- Scalability improvements for larger deployments

---

## Contributing

Contributions are welcome. Please open an issue to discuss any major changes before submitting a pull request.

---

## License

This project is licensed under the MIT License.
