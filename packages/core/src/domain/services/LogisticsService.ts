import { RentalPoint } from '../entities/RentalPoint';

export interface TransferRoute {
  readonly fromLocationId: string;
  readonly toLocationId: string;
  standardTransitDays: number;
  readonly distanceKm?: number;
  readonly availableTransports?: string[];
  readonly costEstimate?: number;
}

export interface TransferTimeLine {
  readonly scheduledDeparture: Date;
  readonly estimatedArrival: Date;
  readonly transitDays: number;
  readonly bufferDays: number;
}

export class LogisticsService {
  private readonly transferRoutes: Map<string, TransferRoute> = new Map();
  private readonly bufferDays = 1;

  constructor() {
    this.initializeDefaultRoutes();
  }
  private initializeDefaultRoutes(): void {
    const routes: TransferRoute[] = [
      // From Ekat
      { fromLocationId: 'EKB', toLocationId: 'UFA', standardTransitDays: 3, distanceKm: 520 },
      { fromLocationId: 'EKB', toLocationId: 'SMR', standardTransitDays: 4, distanceKm: 890 },
      { fromLocationId: 'EKB', toLocationId: 'TMN', standardTransitDays: 3, distanceKm: 325 },
      // From Ufa
      { fromLocationId: 'UFA', toLocationId: 'EKB', standardTransitDays: 3, distanceKm: 520 },
      { fromLocationId: 'UFA', toLocationId: 'SMR', standardTransitDays: 3, distanceKm: 460 },
      { fromLocationId: 'UFA', toLocationId: 'TMN', standardTransitDays: 4, distanceKm: 845 },
      // From Smr
      { fromLocationId: 'SMR', toLocationId: 'EKB', standardTransitDays: 4, distanceKm: 890 },
      { fromLocationId: 'SMR', toLocationId: 'UFA', standardTransitDays: 3, distanceKm: 460 },
      { fromLocationId: 'SMR', toLocationId: 'TMN', standardTransitDays: 5, distanceKm: 1350 },
      // Из Tmn
      { fromLocationId: 'TMN', toLocationId: 'EKB', standardTransitDays: 3, distanceKm: 325 },
      { fromLocationId: 'TMN', toLocationId: 'UFA', standardTransitDays: 4, distanceKm: 845 },
      { fromLocationId: 'TMN', toLocationId: 'SMR', standardTransitDays: 5, distanceKm: 1350 },
    ];

    routes.forEach((route) => {
      const key = this.getRouteKey(route.fromLocationId, route.toLocationId);
      this.transferRoutes.set(key, route);
    });
  }
  calculateTransferTimeLine(
    fromLocation: RentalPoint,
    toLocation: RentalPoint,
    bookingStartDate: Date,
    bookingEndDate: Date,
  ): TransferTimeLine | null {
    const route = this.getRoute(fromLocation.id, toLocation.id);
    if (!route) return null;
    const transitDays = route.standardTransitDays;
    const scheduledDeparture = new Date(bookingStartDate);
    scheduledDeparture.setDate(scheduledDeparture.getDate() - transitDays);
    const estimatedArrival = new Date(bookingEndDate);
    estimatedArrival.setDate(estimatedArrival.getDate() + transitDays + this.bufferDays);
    return {
      scheduledDeparture,
      estimatedArrival,
      transitDays,
      bufferDays: this.bufferDays,
    };
  }
  getRoute(fromLocationId: string, toLocationId: string): TransferRoute | undefined {
    const key = this.getRouteKey(fromLocationId, toLocationId);
    return this.transferRoutes.get(key);
  }
  updateRoute(fromLocationId: string, toLocationId: string, transitDays: number): void {
    const key = this.getRouteKey(fromLocationId, toLocationId);
    const existingRoute = this.transferRoutes.get(key);
    if (existingRoute) {
      existingRoute.standardTransitDays = transitDays;
    } else {
      this.transferRoutes.set(key, {
        fromLocationId,
        toLocationId,
        standardTransitDays: transitDays,
      });
    }
  }
  private getRouteKey(fromLocationId: string, toLocationId: string): string {
    return `${fromLocationId}_${toLocationId}`;
  }
}
