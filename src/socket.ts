import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { handleUserSocket } from "./presentation/sockets/userNotification.socket.js";
import { handleRestaurantSocket } from "./presentation/sockets/restaurantNotification.socket.js";

let io: SocketIOServer;

export const initSocketServer = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*", // You can restrict this to your frontend origin
    },
  });

  console.log("🧩 Socket.IO server initialized and live ✅");

  io.on("connection", (socket: Socket) => {
    console.log("🟢 Client connected:", socket.id);

    // Register notification rooms
    handleUserSocket(socket);
    handleRestaurantSocket(socket);

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};
