/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import QRCode from "qrcode.react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import { api } from "../lib/axios";
import { useSocketHook } from "../hooks/useSocketHook";

interface ModalConnectQrCodeProps {
  open: boolean;
  onClose: () => void;
  connectionId: number | null;
}

export function ModalConnectQrCode({
  open,
  onClose,
  connectionId,
}: ModalConnectQrCodeProps) {
  const [qrCode, setQrCode] = useState("");
  const { getSocket } = useSocketHook()

  useEffect(() => {
    const fetchConnection = async () => {
      if (!connectionId) return;

      try {
        const response = await api.get(`/connections/${connectionId}`);

        setQrCode(response.data.qrcode);
      } catch (error) {
        console.log(error);
      }
    };

    fetchConnection();
  }, [connectionId]);

  useEffect(() => {
    const organizationId = 1;
    const socket = getSocket({ organizationId });

    socket.on(`organization-${organizationId}-whatsappSession`, (data) => {
      if (data.action === "update" && data.session.id === connectionId) {
        setQrCode(data.session.qrcode);
      }

      if (data.action === "update" && data.session.qrcode === "") {
        onClose();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [connectionId, onClose, getSocket]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogTitle>Conectar com WhatsApp</DialogTitle>
        <DialogDescription>
          Abra seu APP do WhatsApp e vá em `Dispositivos conectados`, após isso
          leia o QRCODE abaixo com a câmera e a a conexão estará feita!
        </DialogDescription>

          {qrCode !== '' ? (
        <div className="flex justify-center mt-4 p-4 border rounded-md">
            <QRCode value={qrCode} size={300} />
        </div>
          ) : (
            <h1>Qr Code não disponível</h1>
          )}
      </DialogContent>
    </Dialog>
  );
}
