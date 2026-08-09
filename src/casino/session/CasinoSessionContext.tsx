"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export const CASINO_BUY_IN = 1000;

export type CasinoSessionState = {
  active: boolean;
  bankroll: number;
  startBankroll: number;
  hands: number;
  spins: number;
  startedAt: number | null;
};

export type SessionSummary = {
  bankroll: number;
  startBankroll: number;
  hands: number;
  spins: number;
  startedAt: number | null;
  endedAt: number;
  net: number;
};

type CasinoSessionContextValue = {
  state: CasinoSessionState;
  enterCasino: () => void;
  leaveCasino: () => SessionSummary;
  adjustBankroll: (delta: number) => void;
  recordHand: () => void;
  recordSpin: () => void;
};

const inactiveState = (): CasinoSessionState => ({
  active: false,
  bankroll: 0,
  startBankroll: 0,
  hands: 0,
  spins: 0,
  startedAt: null,
});

const CasinoSessionContext = createContext<CasinoSessionContextValue | null>(
  null,
);

function summarize(
  state: CasinoSessionState,
  endedAt: number,
): SessionSummary {
  return {
    bankroll: state.bankroll,
    startBankroll: state.startBankroll,
    hands: state.hands,
    spins: state.spins,
    startedAt: state.startedAt,
    endedAt,
    net: state.bankroll - state.startBankroll,
  };
}

export function CasinoSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CasinoSessionState>(inactiveState);

  function enterCasino() {
    setState({
      active: true,
      bankroll: CASINO_BUY_IN,
      startBankroll: CASINO_BUY_IN,
      hands: 0,
      spins: 0,
      startedAt: Date.now(),
    });
  }

  function leaveCasino(): SessionSummary {
    const summary = summarize(state, Date.now());
    setState(inactiveState());
    return summary;
  }

  function adjustBankroll(delta: number) {
    setState((current) => {
      if (!current.active) return current;
      return { ...current, bankroll: current.bankroll + delta };
    });
  }

  function recordHand() {
    setState((current) => {
      if (!current.active) return current;
      return { ...current, hands: current.hands + 1 };
    });
  }

  function recordSpin() {
    setState((current) => {
      if (!current.active) return current;
      return { ...current, spins: current.spins + 1 };
    });
  }

  return (
    <CasinoSessionContext.Provider
      value={{
        state,
        enterCasino,
        leaveCasino,
        adjustBankroll,
        recordHand,
        recordSpin,
      }}
    >
      {children}
    </CasinoSessionContext.Provider>
  );
}

export function useCasinoSession(): CasinoSessionContextValue {
  const context = useContext(CasinoSessionContext);
  if (!context) {
    throw new Error(
      "useCasinoSession must be used within CasinoSessionProvider",
    );
  }
  return context;
}
