## 🛠️ TECHNOLOGY STACK

- Frontend: Next.js 15.5.4 (App Router), React 19, TypeScript
- Backend: Node.js + Fastify (for microservice)
- Database: Supabase (PostgreSQL + real time + auth)
- ORM: Prisma + Zod для validation
- Caching: TanStack Query v5
- UI: Ant Design + Tailwind CSS
- PWA: next-pwa
- Offline: IndexedDB + OPFS + CRDT (Y.js)
- WebSocket: Socket.io
- WebRTC: to support video consultations

## 🏗 ARCHITECTURAL PRINCIPLES

- DI (use Awilix for Dependency Injection)
- DDD (Domain-Driven Design)
- CRDT (IndexedDB + OPFS + CRDT (Y.js) for offline synchronization)
- Microservices
- PWA
- Metaprogramming and DSL
