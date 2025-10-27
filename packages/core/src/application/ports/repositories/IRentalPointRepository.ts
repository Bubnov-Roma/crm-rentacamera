import { RentalPoint } from 'src/domain/entities/RentalPoint';

export interface IRentalPointRepository {
  findById(id: string): Promise<RentalPoint | null>;
  findByCode(code: string): Promise<RentalPoint | null>;
  findAllActive(): Promise<RentalPoint[]>;
  save(rentalPoint: RentalPoint): Promise<void>;
}
