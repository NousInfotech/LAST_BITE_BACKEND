import { RestaurantAdminUseCase } from "../application/use-cases/restaurantAdmin.useCase.js";
import { RiderUseCase } from "../application/use-cases/rider.useCase.js";
import { UserUseCase } from "../application/use-cases/user.useCase.js";

const getRoleBasedIdByPhone = async (phoneNumber: string, role: string) => {
    switch (role) {
        case "user": {
            const user = await UserUseCase.getUserByPhoneNumber(phoneNumber);
            if (!user) return null;
            return { roleBasedId: user.userId };
        }
        case "rider": {
            const rider = await RiderUseCase.getRiderByPhoneNumber(phoneNumber);
            if (!rider) return null;
            return { roleBasedId: rider.riderId };
        }
        case "restaurantAdmin": {
            const admin = await RestaurantAdminUseCase.getAdminByPhoneNumber(phoneNumber);
            if (!admin) return null;
            return { roleBasedId: admin.restaurantAdminId };
        }
        default:
            return null;
    }
};

export default getRoleBasedIdByPhone;
