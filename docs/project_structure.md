crm-rentacamera/
├── .github/
│   ├── auto_assign.yml
│   ├── dependabot.yml
│   ├── pull_request_template.md
│   ├── stale.yml
│   └── workflows/
│       ├── auto-deploy.yml
│       ├── ci-cd.yml
│       ├── daily-standup.yml
│       ├── labeler.yml
│       ├── manual-approval.yml
│       ├── security.yml
│       └── weekly-progress.yml
│
├── .husky/ 
│   ├── _
│   ├── commit-msg
│   ├── pre-commit
│   └── pre-push
│
├── .turbo
├── .vscode
│
├── apps/
│   ├── admin/ (Next.js 15.5.4) - admin panel
│   ├── mobile/ (PWA) - mobile app
│   └── web/ (Next.js 15.5.4) - client site
│       ├── .next/
│       ├── .turbo/
│       ├── node_modules/
│       ├── src/
│       │    └── app/
│       │        ├── layout.tsx
│       │        └── page.tsx
│       ├── .eslintrc.json
│       ├── next-env.d.ts
│       ├── next.config.js
│       ├── package.json
│       ├── tsconfig.json
│       └── tsconfig.tsbuildinfo
│
├── docs/
│   ├── context_backup.md
│   ├── diagram.mm
│   ├── every_day_process.md
│   └── project_structure.md
│
├── node_modules/
│
├── packages/
│   │
│   ├── contracts/ - smart-contracts
│   │
│   ├── core/ - domain logic **DDD**
│   │   ├── index.ts  # Public API facade
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .turbo
│   │   ├── dist/
│   │   ├── node_modules/
│   │   └── src/
│   │       ├── index.ts
│   │       ├── application/                      # Application Layer
│   │       │   ├── commands/                     # Команды (CQRS)
│   │       │   │   └── booking/
│   │       │   │       ├── CancelBookingCommand.ts
│   │       │   │       ├── ConfirmBookingCommand.ts
│   │       │   │       ├── CreateBookingCommand.ts
│   │       │   │       └── TransferEquipmentCommand.ts
│   │       │   ├── event-handlers/               # Обработчики событий
│   │       │   ├── ports/                        # Интерфейсы (контракты) для внешних систем
│   │       │   │   ├── gateways/                 # ← ДОБАВИТЬ для внешних сервисов
│   │       │   │   ├── repositories/
│   │       │   │   │   ├── IBookingRepository.ts
│   │       │   │   │   ├── IUserRepository.ts
│   │       │   │   │   └── IEquipmentRepository.ts
│   │       │   │   └── services/
│   │       │   │       └── INotificationService.ts
│   │       │   └── use-cases/                    # Use Cases (бизнес-сценарии)
│   │       │       └── booking/
│   │       │           ├── CancelBookingUseCase.ts
│   │       │           ├── ConfirmBookingUseCase.ts
│   │       │           ├── CreateBookingUseCase.ts
│   │       │           └── TransferEquipmentUseCase
│   │       ├── domain/                                   # Domain Layer
│   │       │   ├── events/                            # События предметной области для Event Sourcing
│   │       │   ├── entities/                          # Сущности (объекты с идентификатором)
│   │       │   │   ├── Booking.ts
│   │       │   │   ├── Equipment.ts
│   │       │   │   ├── EquipmentInstance.ts
│   │       │   │   ├── RentalPoint.ts
│   │       │   │   ├── Transfer.ts
│   │       │   │   └── User.ts
│   │       │   ├── exceptions/                           # Доменные исключения
│   │       │   │   ├── DomainException.ts // Empty !!!!
│   │       │   │   └── BookingException.ts // Empty !!!!
│   │       │   ├── services/                             # Доменные сервисы (логика, не принадлежащая одной сущности)
│   │       │   │   ├── AvailabilityService.ts
│   │       │   │   ├── LogisticsService.ts
│   │       │   │   ├── PenaltyService.ts
│   │       │   │   └── PricingService.ts
│   │       │   ├── specifications/                       # Спецификации (бизнес-правила)
│   │       │   └── value-objects/                        # Value Objects (объекты без идентификатора)
│   │       │       ├── Money.ts
│   │       │       ├── NotificationRecipient.ts
│   │       │       ├── RentalPeriod.ts
│   │       │       └── Address.ts // Empty !!!!
│   │       │
│   │       └── infrastructure/                     # Infrastructure Layer
│   │           │
│   │           ├── events/                         # Реализация событий (Event Publisher)
│   │           ├── configs/                                 # Конфигурация (DI контейнер, настройки)
│   │           │   ├── Container.ts
│   │           │   └── notification.config.ts
│   │           ├── repositories/                           # Реализации репозиториев (Prisma)
│   │           │   └── prisma/
│   │           │       ├── PrismaBookingRepository.ts
│   │           │       ├── PrismaEquipmentRepository.ts
│   │           │       ├── PrismaRentalPointRepository.ts
│   │           │       └── PrismaUserRepository.ts
│   │           ├── services/                             # Реализации внешних сервисов (уведомления, и т.д.)
│   │           │   ├── notification/
│   │           │   │   ├── NotificationService.ts
│   │           │   │   ├── templates/                    # ← ВЫНЕСТИ шаблоны
│   │           │   │   │   ├── BookingTemplates.ts
│   │           │   │   │   ├── SystemTemplates.ts
│   │           │   │   │   └── TemplateEngine.ts
│   │           │   │   └── providers/
│   │           │   │       ├── email/
│   │           │   │       │   └── ResendEmailProvider.ts
│   │           │   │       ├── push/
│   │           │   │       │   ├── web-push/ 
│   │           │   │       │   │   ├── WebPushProvider.ts
│   │           │   │       │   │   ├── ServerWebPushProvider.ts
│   │           │   │       │   │   ├── WebPushProviderFactory.ts
│   │           │   │       │   │   └── WebPushEnvironmentService.ts
│   │           │   │       │   └── supabase/
│   │           │   │       │       └── SupabasePushProvider.ts
│   │           │   │       ├── ServerWebPushProvider.ts
│   │           │   │       ├── TelegramProvider.ts
│   │           │   │       ├── TextBeltSMSProvider.ts
│   │           │   │       ├── WebPushProvider.ts
│   │           │   │       └── WebPushProviderFactory.ts
│   │           │   └─ external/                 # ← ДОБАВИТЬ для внешних API
│   │           │
│   │           ├── messaging/                    # ← ДОБАВИТЬ для событий
│   │           └── types/                         # Infrastructure-specific types
│   │               ├── booking-types.ts
│   │               ├── notification-service-types.ts
│   │               ├── user-types.ts
│   │               └── web-push-types.ts
│   │      
│   │
│   ├── database/ - Prisma + schema
│   │   ├── .turbo
│   │   ├── node_modules/
│   │   ├── prisma
│   │   │   ├── migrations
│   │   │   ├── schema.prisma              # main file
│   │   │   ├── models/
│   │   │   │   ├── booking.prisma        # booking & logistic
│   │   │   │   ├── equipment.prisma      # equipment & category
│   │   │   │   ├── payment.prisma        # payment & finance
│   │   │   │   ├── system.prisma         # system tables
│   │   │   │   └── user.prisma           # users & roles
│   │   │   └── enums/
│   │   │       ├── user.enum.prisma
│   │   │       ├── equipment.enum.prisma
│   │   │       ├── booking.enum.prisma
│   │   │       └── system.enum.prisma
│   │   │        
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── prisma-client.ts
│   │   │ 
│   │   ├── .env
│   │   └── package.json
│   │   
│   ├── ui/ - shared components (Ant Design + custom)
│   │   ├── .turbo
│   │   ├── dist/
│   │   ├── node_modules/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── TestComponent.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.json
│   │   └── vite.config.ts.timestamp-1761564384085-e15488a9f6cf6.mjs
│   │
│   └── utils/ - utils
│       └── type-utils.ts
│
├── public/
│   └── sw.js
│
├── scripts/
│   ├── .env.example
│   └── setup.sh
│
├── services/
│   ├── api-gateway/ (Node.js + Fastify)
│   │   └── src/
│   │       └── plugins/ Empty !!!
│   │
│   ├── auth-service/ (NextAuth.js + JWT)
│   ├── booking-service/ (microservice for booking)
│   ├── notification-service/ (notification)
│   └── sync-service/ (CRDT + WebSocket)
│
├── .env.locale
├── .gitignore
├── .prettierignore
├── .prettierrc
├── commitlint.config.js
├── eslint.config.js (v ^9.37.0)
├── package.json 
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── tailwind.config.js
├── tsconfig.ci.json
├── tsconfig.json
├── tsconfig.tsbuildinfo
└── turbo.json