import { Socket } from "socket.io";
import { getIO } from "../../socket.js";

const USER_ROOM_PREFIX = "user:";

export const handleUserSocket = (socket: Socket) => {
  // Join room
  socket.on("register_user", (userId: string) => {
    socket.join(`${USER_ROOM_PREFIX}${userId}`);
    console.log(`✅ User ${userId} joined room ${USER_ROOM_PREFIX}${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(`👤 User socket disconnected: ${socket.id}`);
  });
};

// Send notification to a specific user
export const sendUserNotification = (userId: string, data: any) => {
  const io = getIO();
  io.to(`${USER_ROOM_PREFIX}${userId}`).emit("user_notification", data);
};
