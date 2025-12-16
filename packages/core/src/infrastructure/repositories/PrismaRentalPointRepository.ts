import { PrismaClient } from '@prisma/client';
import { IRentalPointRepository } from 'src/application/ports/repositories/IRentalPointRepository';
import { RentalPoint, RentalPointData } from 'src/domain/entities/RentalPoint';

export class PrismaRentalPointRepository implements IRentalPointRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<RentalPoint | null> {
    const rentalPointData = await this.prisma.rentalPoint.findUnique({
      where: { id },
    });
    if (!rentalPointData) return null;
    return this.toDomainEntity(rentalPointData);
  }
  async findByCode(code: string): Promise<RentalPoint | null> {
    const rentalPointData = await this.prisma.rentalPoint.findUnique({
      where: { code },
    });
    if (!rentalPointData) return null;
    return this.toDomainEntity(rentalPointData);
  }
  async findAllActive(): Promise<RentalPoint[]> {
    const rentalPointsData: RentalPointData[] = await this.prisma.rentalPoint.findMany({
      where: { isActive: true },
    });
    return rentalPointsData.map((data) => this.toDomainEntity(data));
  }
  async save(rentalPoint: RentalPoint): Promise<void> {
    const data: RentalPointData = {
      id: rentalPoint.id,
      name: rentalPoint.name,
      code: rentalPoint.code,
      address: rentalPoint.address,
      isActive: rentalPoint.isActive,
      updatedAt: new Date(),
    };
    await this.prisma.rentalPoint.upsert({
      where: { id: rentalPoint.id },
      create: {
        ...data,
        createdAt: new Date(),
      },
      update: data,
    });
  }
  private toDomainEntity(prismaData: RentalPointData): RentalPoint {
    return RentalPoint.reconstitute(prismaData);
  }
}
