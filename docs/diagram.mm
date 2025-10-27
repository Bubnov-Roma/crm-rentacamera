// Mermaid architecture diagram
graph TB
    %% Architecture layers
    subgraph "Presentation Layer"
        WEB[Web App<br/>Next.js]
        ADMIN[Admin Panel<br/>Next.js]
        MOBILE[Mobile PWA<br/>React Native]
        API[API Gateway<br/>Fastify]
    end

    subgraph "Application Layer"
        subgraph "Use Cases"
            UC1[CreateBookingUseCase]
            UC2[ConfirmBookingUseCase]
            UC3[TransferEquipmentUseCase]
            UC4[CalculatePricingUseCase]
        end
        
        subgraph "Commands & Queries"
            CMD[Command Bus]
            QUERY[Query Bus]
        end
    end

    subgraph "Domain Layer"
        subgraph "Aggregates"
            A1[BookingAggregate]
            A2[UserAggregate]
            A3[EquipmentAggregate]
        end
        
        subgraph "Entities"
            E1[Booking]
            E2[User]
            E3[Equipment]
            E4[RentalPoint]
        end
        
        subgraph "Value Objects"
            VO1[Money]
            VO2[RentalPeriod]
            VO3[Address]
        end
        
        subgraph "Domain Services"
            DS1[PricingService]
            DS2[AvailabilityService]
            DS3[PenaltyService]
        end
        
        subgraph "Domain Events"
            DE1[BookingCreated]
            DE2[EquipmentReserved]
            DE3[PaymentProcessed]
        end
    end

    subgraph "Infrastructure Layer"
        subgraph "Repositories"
            R1[BookingRepository]
            R2[UserRepository]
            R3[EquipmentRepository]
        end
        
        subgraph "External Services"
            S1[Payment Gateway]
            S2[Email Service]
            S3[Notification Service]
            S4[1C Integration]
        end
        
        subgraph "Persistence"
            DB1[(PostgreSQL<br/>Supabase)]
            DB2[IndexedDB<br/>Offline Cache]
        end
    end

    %% Connections
    WEB --> API
    ADMIN --> API
    MOBILE --> API
    
    API --> CMD
    API --> QUERY
    
    CMD --> UC1
    CMD --> UC2
    CMD --> UC3
    QUERY --> UC4
    
    UC1 --> A1
    UC2 --> A1
    UC3 --> A3
    UC4 --> DS1
    
    A1 --> E1
    A2 --> E2
    A3 --> E3
    
    E1 --> VO1
    E1 --> VO2
    E2 --> VO3
    
    DS1 --> VO1
    DS2 --> E3
    DS3 --> VO1
    
    A1 --> DE1
    A1 --> DE2
    A2 --> DE3
    
    R1 --> DB1
    R2 --> DB1
    R3 --> DB1
    
    DE1 --> S2
    DE2 --> S3
    DE3 --> S1
    
    DB2 -.->|Sync.-> DB1
    
    classDef presentation fill:#e1f5fe
    classDef application fill:#f3e5f5
    classDef domain fill:#e8f5e8
    classDef infrastructure fill:#fff3e0
    
    class WEB,ADMIN,MOBILE,API presentation
    class UC1,UC2,UC3,UC4,CMD,QUERY application
    class A1,A2,A3,E1,E2,E3,E4,VO1,VO2,VO3,DS1,DS2,DS3,DE1,DE2,DE3 domain
    class R1,R2,R3,S1,S2,S3,S4,DB1,DB2 infrastructure


// 🔄 Mermaid diagram booking process
    sequenceDiagram
    participant C as Client
    participant WEB as Web App
    participant API as API Gateway
    participant UC as CreateBookingUseCase
    participant BR as BookingRepository
    participant ER as EquipmentRepository
    participant PS as PricingService
    participant NS as NotificationService
    participant DB as Database

    C->>WEB: Выбирает технику + даты
    WEB->>API: POST /bookings
    API->>UC: CreateBookingCommand
    
    UC->>ER: checkAvailability(equipment, dates)
    ER->>DB: SELECT availability
    DB-->>ER: availability data
    ER-->>UC: availability status
    
    alt Не доступно
        UC-->>API: Error - Equipment not available
        API-->>WEB: 409 Conflict
        WEB-->>C: Показать ошибку
    else Доступно
        UC->>PS: calculateTotal(equipment, dates, client)
        PS-->>UC: totalAmount, depositAmount
        
        UC->>UC: Booking.create(...)
        UC->>BR: save(booking)
        BR->>DB: INSERT booking
        DB-->>BR: booking created
        BR-->>UC: success
        
        UC->>NS: sendConfirmation(client, booking)
        NS->>C: Email/Telegram уведомление
        
        UC-->>API: Booking created
        API-->>WEB: 201 Created
        WEB-->>C: Подтверждение брони
    end

// 🏢 Mermaid diagram module structure
graph LR
    subgraph "Core Platform"
        CORE[Core Domain<br/>Shared Kernel]
    end

    subgraph "Sellable Modules"
        subgraph "Admin Module"
            AM1[Booking Management]
            AM2[User Management]
            AM3[Equipment Catalog]
            AM4[Analytics & Reports]
        end
        
        subgraph "Client Module"
            CM1[Booking Interface]
            CM2[Personal Account]
            CM3[Equipment Browser]
            CM4[Payment Processing]
        end
        
        subgraph "Partner Module"
            PM1[Partner Dashboard]
            PM2[Equipment Submission]
            PM3[Revenue Tracking]
            PM4[Contract Management]
        end
    end

    subgraph "Integration Modules"
        IM1[1C Accounting]
        IM2[Payment Gateways]
        IM3[Email/SMS Services]
        IM4[Telegram Bot]
    end

    AM1 --> CORE
    AM2 --> CORE
    AM3 --> CORE
    AM4 --> CORE
    
    CM1 --> CORE
    CM2 --> CORE
    CM3 --> CORE
    CM4 --> CORE
    
    PM1 --> CORE
    PM2 --> CORE
    PM3 --> CORE
    PM4 --> CORE
    
    IM1 --> CORE
    IM2 --> CORE
    IM3 --> CORE
    IM4 --> CORE

    classDef core fill:#4caf50,color:white
    classDef module fill:#2196f3,color:white
    classDef integration fill:#ff9800,color:white
    
    class CORE core
    class AM1,AM2,AM3,AM4,CM1,CM2,CM3,CM4,PM1,PM2,PM3,PM4 module
    class IM1,IM2,IM3,IM4 integration