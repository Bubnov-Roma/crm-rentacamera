export interface IRentalPointRepository {
  findById(id: string): Promise<unknown | null>;
}
