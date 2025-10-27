import { Equipment, EquipmentStatus } from 'src/domain/entities/Equipment';

export interface IEquipmentRepository {
  isAvailable(equipmentInstanceId: string, startDate: Date, endDate: Date): Promise<boolean>;
  findById(id: string): Promise<Equipment | null>;
  findByCategory(categoryId: string): Promise<Equipment[]>;
  save(equipment: Equipment): Promise<void>;
  updateStatus(equipmentId: string, status: EquipmentStatus): Promise<void>;
  findByPartner(partnerId: string): Promise<Equipment[]>;
}
