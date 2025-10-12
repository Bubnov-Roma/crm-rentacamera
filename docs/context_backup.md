# 🗂️ Context for CRM RENTACAMERA

## 📅 Date update: $(current_date)

## 🎯 ТЕКУåЩИЙ ЭТАП
**Фаза 0.1: Проектирование архитектуры**
- ✅ Определены требования и роли пользователей
- ✅ Спроектирована детальная ERD диаграмма
- 🚀 В процессе: Создание Draw.io диаграммы

### 🏗️ Architecture patterns

- DI (use Awilix for Dependency Injection)
- DDD (Domain-Driven Design)
- CRDT (IndexedDB + OPFS + CRDT (Y.js) for offline synchronization)
- Microservices
- PWA
- Metaprogramming and DSL

### Stack technologies:
- **Monorepo**: Turborepo
- **Frontend**: Next.js 15.5.4 + React 19 + TypeScript
- **Backend**: Node.js + Fastify (microservices)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma + Zod
- **Caching**: TanStack Query v5
- **DI**: Awilix
- **UI**: Ant Design + Tailwind CSS
- **PWA**: next-pwa
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