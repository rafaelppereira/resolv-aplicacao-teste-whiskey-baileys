/* eslint-disable @typescript-eslint/no-explicit-any */
import openSocket, { Socket } from "socket.io-client";

interface UseSocketHookResponse {
  getSocket: ({ organizationId }: { organizationId: number }) => Socket
}

export function useSocketHook(): UseSocketHookResponse {
  function getSocket({ organizationId }: { organizationId: number }) {
    const socket = openSocket("http://localhost:3000", {
      transports: ["websocket"],
      query: { organizationId },
    });

    socket.on("disconnect", (reason: string) => {
      // console.warn(`Socket desconectado por conta de: ${reason}`);
      if (reason.startsWith("io")) {
        // console.warn("Tentando reconectar novamente", socket);

        socket.connect();
      }
    });

    socket.on("connect", (...params: any) => {
      // console.warn("Socket conectado com sucesso", params);
    });

    return socket;
  }

  return {
    getSocket,
  };
}
