import { EquipmentTransfer } from 'src/domain/entities/Transfer';

export interface ITransferRepository {
  save(transfer: EquipmentTransfer): Promise<void>;
  findById(id: string): Promise<EquipmentTransfer | null>;
  findByEquipmentInstance(equipmentInstanceId: string): Promise<EquipmentTransfer[]>;
  findConflictingTransfers(
    equipmentInstanceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<EquipmentTransfer[]>;
  updateStatus(transferId: string, status: string): Promise<void>;
}
