"use client";

import { getPartyHost, getPartyPartyName } from "@/lib/play/partyHost";
import { normalizeRoomCode } from "@/lib/play/roomCode";
import type {
  ClientMessage,
  RoomState,
  ServerMessage,
} from "@shared/playProtocol";
import { PartySocket } from "partysocket";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function usePlayRoom(code: string, displayName: string) {
  const roomCode = useMemo(() => normalizeRoomCode(code), [code]);
  const [status, setStatus] = useState<"connecting" | "live" | "error">(
    "connecting",
  );
  const [error, setError] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [clientId] = useState(() => {
    const storageKey = `play:clientId:${displayName.toLowerCase()}`;
    try {
      let id = sessionStorage.getItem(storageKey) || "";
      if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem(storageKey, id);
      }
      return id;
    } catch {
      return `tmp-${Math.random().toString(36).slice(2, 10)}`;
    }
  });
  const [room, setRoom] = useState<RoomState | null>(null);
  const socketRef = useRef<PartySocket | null>(null);

  useEffect(() => {
    if (roomCode.length < 4) {
      setStatus("error");
      setError("Invalid room code.");
      return;
    }

    const host = getPartyHost();
    const party = getPartyPartyName();
    const protocol =
      host.startsWith("localhost") || host.startsWith("127.") ? "ws" : "wss";
    const socket = new PartySocket({
      host,
      party,
      room: roomCode.toLowerCase(),
      protocol,
    });
    socketRef.current = socket;
    let opened = false;

    socket.addEventListener("open", () => {
      opened = true;
      setStatus("live");
      setError(null);
      socket.send(
        JSON.stringify({
          type: "hello",
          name: displayName,
          clientId,
        } satisfies ClientMessage),
      );
    });

    socket.addEventListener("message", (event) => {
      try {
        const msg = JSON.parse(String(event.data)) as ServerMessage;
        if (msg.type === "welcome") {
          setConnectionId(msg.connectionId);
          setRoom(msg.state);
          return;
        }
        if (msg.type === "state") {
          setRoom(msg.state);
          return;
        }
        if (msg.type === "error") {
          setError(msg.message);
        }
      } catch {
        /* ignore */
      }
    });

    socket.addEventListener("error", () => {
      setStatus("error");
      setError(`Could not reach party server (${protocol}://${host}).`);
    });

    socket.addEventListener("close", () => {
      if (!opened) {
        setStatus("error");
        setError("WebSocket closed before connect.");
        return;
      }
      setStatus((s) => (s === "error" ? s : "connecting"));
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [roomCode, displayName, clientId]);

  const send = useCallback(
    (msg: ClientMessage) => {
      const payload = clientId ? { ...msg, clientId } : msg;
      socketRef.current?.send(JSON.stringify(payload));
    },
    [clientId],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    roomCode,
    status,
    error,
    clearError,
    connectionId,
    clientId,
    room,
    send,
    isHost:
      clientId != null &&
      room?.hostClientId != null &&
      room.hostClientId === clientId,
    isSpectator: (() => {
      const youId = room?.youId ?? connectionId;
      return youId != null && (room?.spectatorIds.includes(youId) ?? false);
    })(),
  };
}
