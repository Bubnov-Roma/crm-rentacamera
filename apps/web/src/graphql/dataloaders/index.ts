import DataLoader from 'dataloader';
import { Container } from '@rentacamera/core';

export function createDataLoaders() {
  const equipmentRepository = Container.getEquipmentRepository();
  const userRepository = Container.getUserRepository();

  return {
    // Equipment loader
    equipment: new DataLoader(async (ids: readonly string[]) => {
      const equipment = await Promise.all(ids.map((id) => equipmentRepository.findById(id)));
      return equipment;
    }),

    // User loader
    user: new DataLoader(async (ids: readonly string[]) => {
      const users = await Promise.all(ids.map((id) => userRepository.findById(id)));
      return users;
    }),
  };
}
