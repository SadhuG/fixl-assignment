# TaskHive

A multi-tenant project and task portal built on the MERN stack. Users create organizations, invite members, and manage projects and tasks. The API enforces every tenant boundary.

## Stack

- **API** (`server/`): Node 22+, Express 5, MongoDB/Mongoose, Zod, JWT in an httpOnly cookie, Jest + Supertest
- **Web** (`client/`): React 19, Vite, Tailwind CSS 4, shadcn/ui, TanStack Query, React Router, React Hook Form

## Getting started

```bash
npm run setup                          # install all packages
cp server/.env.example server/.env     # then set MONGODB_URI and JWT_SECRET
npm run dev                            # API :4000, web :5173
```

| Command          | What it does                        |
| ---------------- | ----------------------------------- |
| `npm test`       | Server test suite (in-memory Mongo) |
| `npm run lint`   | Lint server and client              |
| `npm run build`  | Production build of the client      |
| `npm run format` | Format with Prettier                |
