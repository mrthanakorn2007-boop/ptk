# PTK Connext Backend

![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

The core backend API for the **PTK Connext** digital learning platform. Built with **Hono** on the **Bun** runtime for high performance and low latency.

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- [**Architecture**](./docs/ARCHITECTURE.md): System overview, tech stack, and directory structure.
- [**Database**](./docs/DATABASE.md): Schema details, migrations, and seeding.
- [**API Development**](./docs/API_DEVELOPMENT.md): Guide to creating new endpoints and modules.
- [**Contributing**](./docs/CONTRIBUTING.md): Setup guide and coding standards.

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) (v1.0+)
- PostgreSQL Database

### Installation

1.  **Install Dependencies**
    ```bash
    bun install
    ```

2.  **Configure Environment**
    ```bash
    cp .env.example .env
    # Edit .env with your DATABASE_URL
    ```

3.  **Setup Database**
    ```bash
    bun x drizzle-kit push
    bun run seed
    ```

4.  **Run Server**
    ```bash
    bun run dev
    ```

The API will be available at **http://localhost:4001**.

## 📖 API Reference

Once the server is running, you can access the interactive documentation:

- **Landing Page**: [http://localhost:4001](http://localhost:4001) - Overview with all available endpoints
- **Swagger UI (Scalar)**: [http://localhost:4001/reference](http://localhost:4001/reference)
- **OpenAPI Spec**: [http://localhost:4001/doc](http://localhost:4001/doc)

### Available Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Landing page with API overview | No |
| GET | `/students` | List all students (paginated) | Yes |
| GET | `/students/me` | Get current user profile | Yes |
| GET | `/config` | Get school configuration | No |
| GET | `/doc` | OpenAPI specification (JSON) | No |
| GET | `/reference` | Interactive API documentation | No |

## 🛠 Tech Stack

- **Runtime**: Bun
- **Framework**: Hono (OpenAPI)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Auth**: Supabase Auth

## License

Private repository for Pathumthep Wittayakarn School.
