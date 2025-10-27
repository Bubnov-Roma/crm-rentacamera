# 🗂️ Context for CRM RENTACAMERA

### 🏗️ Architecture patterns

- **Manual DI** ( Dependency Injection )
- **DDD** ( Domain-Driven Design )
- **CRDT** (IndexedDB + OPFS + CRDT (Y.js) for offline synchronization)
- **Microservices**
- **PWA**
- **Metaprogramming and DSL**
- **CQRS** (Command Query Responsibility Segregation for splitting read/write operations)
- **Saga** ( for management distributed transactions )
- **Strategy** ( for different pricing strategies )
- **Factory** ( for different user types )
- **Event Sourcing** ( for audit and analytics )
- **Module Federation** ( for sale of various modules )
- **Clean Architecture**

### Principe
- Full type safety 


### Stack technologies:
- **Monorepo**: Turborepo
- **Languages**: TypeScript
- **Framework**: Next.js 15.5.4
- **Backend**: Node.js
- **Microservices**: Fastify
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Validation**: Zod
- **Authorization**: Next Auth
- **Caching**: TanStack Query
- **UI**: Ant Design
- **CSS**: Tailwind
- **PWA**: Next-Pwa
- **Offline**: IndexedDB + OPFS + CRDT (Y.js)
- **WebSocket**: Socket.io
- **WebRTC**: to support video consultations


### Key modules:
apps/
├── web/ (client site)
├── admin/ (admin panel)
└── mobile/ (PWA)
packages/
├── ui/ (shared components)
├── database/ (Prisma schemes)
├── utils/ (shared utils)
├── contracts/ (smart-contracts)
└── core/ (domain logic)

### Domain models map 

- User → Client | Admin | Manager
- Camera → DSLR | Lens | Accessory | Lighting  
- Booking → Pending | Confirmed | Active | Completed
- RentalPoint → Ekb | Ufa | Smr | Tmn | Online
- Payment → Deposit | Rental | Fine