import { Socket } from "socket.io";
import { getIO } from "../../socket.js";

const MART_STORE_ROOM_PREFIX = "martstore:";

export const handleMartStoreSocket = (socket: Socket) => {
  // Join room
  socket.on("register_martstore", (martStoreId: string) => {
    socket.join(`${MART_STORE_ROOM_PREFIX}${martStoreId}`);
    console.log(`✅ Mart Store ${martStoreId} joined room ${MART_STORE_ROOM_PREFIX}${martStoreId}`);
  });

  socket.on("disconnect", () => {
    console.log(`🛒 Mart Store socket disconnected: ${socket.id}`);
  });
};

// Send notification to a specific mart store
export const sendMartStoreNotification = (martStoreId: string, data: any) => {
  const io = getIO();
  io.to(`${MART_STORE_ROOM_PREFIX}${martStoreId}`).emit("martstore_notification", data);
};
