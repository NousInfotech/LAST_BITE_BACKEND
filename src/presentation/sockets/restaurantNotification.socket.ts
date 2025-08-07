import { Socket } from "socket.io";
import { getIO } from "../../socket.js";

const RESTAURANT_ROOM_PREFIX = "restaurant:";

export const handleRestaurantSocket = (socket: Socket) => {
  // Join room
  socket.on("register_restaurant", (restaurantId: string) => {
    socket.join(`${RESTAURANT_ROOM_PREFIX}${restaurantId}`);
    console.log(`✅ Restaurant ${restaurantId} joined room ${RESTAURANT_ROOM_PREFIX}${restaurantId}`);
  });

  socket.on("disconnect", () => {
    console.log(`🍴 Restaurant socket disconnected: ${socket.id}`);
  });
};

// Send notification to a specific restaurant
export const sendRestaurantNotification = (restaurantId: string, data: any) => {
  const io = getIO();
  io.to(`${RESTAURANT_ROOM_PREFIX}${restaurantId}`).emit("restaurant_notification", data);
};
