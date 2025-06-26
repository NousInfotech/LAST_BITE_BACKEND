import { IRider } from "../../domain/interfaces/rider.interface.js";
import { RiderRepository } from "../../infrastructure/repositories/rider.repository.js";
import { calculateAge } from "../../utils/ageCalculation.js";

const riderRepo = new RiderRepository();

export const RiderUseCase = {
  createRider: (data: IRider) => {
    if (data.dateOfBirth) {
      const dob = new Date(data.dateOfBirth);
      const age = calculateAge(dob);

      if (age < 18) {
        throw new Error("Rider must be at least 18 years old.");
      }
    } else {
      throw new Error("Date of birth is required to verify age.");
    }

    return riderRepo.create(data);
  },
  getRiderById: (riderId: string) => riderRepo.findByRiderId(riderId),
  getRiderByPhoneNumber: (phoneNumber: string) => riderRepo.findByRiderPhoneNumber(phoneNumber),
  updateRider: (riderId: string, data: Partial<IRider>) => riderRepo.updateRider(riderId, data),
  deleteRider: (riderId: string) => riderRepo.deleteRider(riderId),

  getAllRiders: (filter?: Partial<IRider>) => riderRepo.getAllRiders(filter),
  bulkCreateRiders: (riders: IRider[]) => riderRepo.bulkCreate(riders),
  bulkGetRidersByIds: (riderIds: string[]) => riderRepo.bulkGetByRiderIds(riderIds),
};
