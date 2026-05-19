"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocketClient() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!socket) {
    socket = io({
      transports: ["websocket", "polling"],
    });
  }

  return socket;
}
