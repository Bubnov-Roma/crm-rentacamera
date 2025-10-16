export interface IEquipmentRepository {
  isAvailable(equipmentInstanceId: string, startDate: Date, endDate: Date): Promise<boolean>;
  findById(id: string): Promise<unknown | null>;
}
