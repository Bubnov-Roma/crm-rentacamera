import { IEquipmentRepository } from '../../application/ports/repositories/IEquipmentRepository';
import { RentalPeriod } from '../value-objects/RentalPeriod';

export class EquipmentIsAvailableSpecification {
  constructor(private readonly equipmentRepository: IEquipmentRepository) {}

  async isSatisfiedBy(equipmentId: string, period: RentalPeriod): Promise<boolean> {
    const equipment = await this.equipmentRepository.findById(equipmentId);
    if (!equipment || !equipment.isAvailableForRent()) {
      return false;
    }

    return await this.equipmentRepository.isAvailable(
      equipmentId,
      period.startDate,
      period.endDate,
    );
  }
}
