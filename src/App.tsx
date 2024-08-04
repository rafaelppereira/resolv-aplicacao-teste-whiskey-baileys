/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useReducer, useState } from "react";
import { api } from "./lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Button } from "./components/ui/button";
import { Loader2, Plus, RefreshCcw, Rss, Trash, Wifi, X } from "lucide-react";

import { ModalConnectQrCode } from "./components/modal-connect-qrcode";
import { reducer } from "./utils/reducer";
import { useSocketHook } from "./hooks/useSocketHook";
import { Badge } from "./components/ui/badge";
import { convertStatus } from "./utils/convert-status";
import { Progress } from "./components/ui/progress";

interface ConnectionProps {
  id: number;
  name: string;
  status: string;
}

export function App() {
  const [connections, dispatch]: any = useReducer(reducer, []);

  const [connectionId, setConnectionId] = useState<number | null>(null);
  const [hasLoadingCreateNewConnection, setHasLoadingCreateNewConnection] =
    useState(false);

  const [isToggleModalConnectQrCode, setIsToggleModalConnectQrCode] =
    useState(false);

  const { getSocket } = useSocketHook();

  async function getAllWhatsapps() {
    const response = await api.get("/connections/?session=0");

    dispatch({ type: "LOAD_CONNECTIONS", payload: response.data });
  }

  // FUNC: Essa função criar uma nova conexão
  async function handleCreateNewConnection() {
    if (connections.length > 4) {
      alert('Seu limite de conexões é de 5')
    }

    setHasLoadingCreateNewConnection(true);
    await api.post("/connections", {});
    setHasLoadingCreateNewConnection(false);
  }

  // FUNC: Essa função inicia uma nova sessão
  async function handleStartWhatsappSession(connectionId: number) {
    await api.post("/wppsessions", {
      connectionId,
      organizationId: 1,
    });
  }

  // FUNC: Essa função gera um novo QRCODE para a sessão
  async function handleRequestNewQrCode(connectionId: number) {
    await api.put(`/wppsessions/${connectionId}`, {
      organizationId: 1,
    });
  }

  // FUNC: Essa função realizar o DISCONNECT do whatsapp na instância
  async function handleDisconnectOrDeleteWhatsappSession(connectionId: number) {
    await api.delete(`/wppsessions/${connectionId}`, {
      params: {
        organizationId: 1,
      },
    });
  }

  // FUNC: Essa função deleta a conexão da tela e do banco de dados
  async function handleRemoveConnection(connectionId: number) {
    await api.delete(`/connections/${connectionId}`, {
      params: {
        organizationId: 1,
      },
    });
  }

  useEffect(() => {
    const organizationId = 1;
    const socket = getSocket({ organizationId });

    socket.on(`organization-${organizationId}-whatsapp`, (data) => {
      if (data.action === "update") {
        dispatch({ type: "UPDATE_CONNECTIONS", payload: data.connection });
      }
    });

    socket.on(`organization-${organizationId}-whatsapp`, (data) => {
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONNECTIONS", payload: data.whatsappId });
      }
    });

    socket.on(`organization-${organizationId}-whatsappSession`, (data) => {
      if (data.action === "update") {
        dispatch({ type: "UPDATE_SESSION", payload: data.session });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [getSocket]);

  useEffect(() => {
    getAllWhatsapps();
  }, []);

  return (
    <div className="m-5 space-y-4 max-w-6xl mx-auto px-8">
      {connectionId && (
        <ModalConnectQrCode
          connectionId={connectionId}
          open={isToggleModalConnectQrCode}
          onClose={() => {
            setIsToggleModalConnectQrCode(!isToggleModalConnectQrCode);
            setConnectionId(null);
          }}
        />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-zinc-600 font-bold tracking-tight">
          Conexões
        </h1>

        <Progress className="w-[300px]" value={(connections.length / 5) * 100} />

        <Button
          size="sm"
          type="button"
          onClick={handleCreateNewConnection}
          disabled={hasLoadingCreateNewConnection}
          className="bg-violet-500 hover:bg-violet-600 transition-all"
        >
          {hasLoadingCreateNewConnection ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Plus className="size-4 mr-2" />
          )}
          Adicionar WhatsApp
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {connections.length > 0 ? (
              connections.map((connection: ConnectionProps, i: number) => {
                return (
                  <TableRow key={i}>
                    <TableCell>{connection.name}</TableCell>
                    <TableCell>
                      {connection.status === "DISCONNECTED" && (
                        <Badge className="bg-red-500">
                          {convertStatus[connection.status]}
                        </Badge>
                      )}

                      {connection.status === "qrcode" && (
                        <Badge className="bg-blue-500">
                          {convertStatus[connection.status]}
                        </Badge>
                      )}

                      {connection.status === "PENDING" && (
                        <Badge className="bg-yellow-500">
                          {convertStatus[connection.status]}
                        </Badge>
                      )}

                      {connection.status === "CONNECTED" && (
                        <Badge className="bg-emerald-500">
                          {convertStatus[connection.status]}
                        </Badge>
                      )}

                      {connection.status === "OPENING" && (
                        <Badge className="bg-orange-500">
                          {convertStatus[connection.status]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {connection.status === "qrcode" && (
                        <Button
                          size="sm"
                          type="button"
                          onClick={() => {
                            setIsToggleModalConnectQrCode(true);
                            setConnectionId(connection.id);
                          }}
                          className="bg-violet-500 hover:bg-violet-600 transition-all"
                        >
                          <Rss className="size-4 mr-2" />
                          Abrir QRCode
                        </Button>
                      )}

                      {connection.status === "DISCONNECTED" && (
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => {
                              handleStartWhatsappSession(connection.id);
                            }}
                            className="bg-zinc-500 hover:bg-zinc-600 transition-all"
                          >
                            <RefreshCcw className="size-4 mr-2" />
                            Tentar novamente
                          </Button>
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => {
                              handleRequestNewQrCode(connection.id);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 transition-all"
                          >
                            <Rss className="size-4 mr-2" />
                            Novo QRCode
                          </Button>
                        </div>
                      )}

                      {connection.status === "CONNECTED" ||
                        connection.status === "PAIRING" ||
                        (connection.status === "TIMEOUT" && (
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => {
                              handleDisconnectOrDeleteWhatsappSession(
                                connection.id
                              );
                            }}
                            className="bg-red-500 hover:bg-red-600 transition-all"
                          >
                            <X className="size-4 mr-2" />
                            Desconectar
                          </Button>
                        ))}

                      {connection.status === "OPENING" && (
                        <Button
                          className="bg-yellow-500 disabled:opacity-100 animate-pulse"
                          disabled
                        >
                          <Loader2 className="size-2 mr-2 animate-spin" />
                          <Wifi className="size-4 mr-2" />
                          Carregando
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleRemoveConnection(connection.id)}
                        type="button"
                        size="icon"
                        variant="destructive"
                      >
                        <Trash className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell>Sem conexões criadas...</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
