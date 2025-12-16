import { createContext, useContext, useMemo, useState } from "react";

export type Player = { id: string; name: string };

type PlayersContextType = {
  players: Player[];
  addPlayer: (name: String) => void;
  removePlayer: (id: string) => void;
  clearPlayers: () => void;
};

const PlayersContext = createContext<PlayersContextType | undefined>(undefined);

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function PlayersProvider({ children }: { children: React.ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);

  const addPlayer = (name: String) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlayers((prev) => [...prev, { id: makeId(), name: trimmed }]);
  }

  const removePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((player) => player.id !== id));
  };

  const clearPlayers = () => {
    setPlayers([]);
  };

  const value = useMemo(
    () => ({ players, addPlayer, removePlayer, clearPlayers }),
    [players]
  );

  return <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>;
}

export function usePlayers() {
  const ctx = useContext(PlayersContext);
  if (!ctx) throw new Error("usePlayers must be used within a PlayersProvider");
  return ctx;
}