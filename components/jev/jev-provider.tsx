"use client"

import * as React from "react"

import type { JevResponse, JevSource } from "@/lib/jev/types"

export type JevCall = {
  id: number
  useCase: string
  latencyMs: number
  roundTripMs: number
  source: JevSource
  questions: number
  at: number
}

type JevContextValue = {
  showProbabilities: boolean
  setShowProbabilities: (value: boolean) => void
  mode: JevSource | null
  calls: JevCall[]
  record: (useCase: string, response: JevResponse, roundTripMs: number) => void
}

const JevContext = React.createContext<JevContextValue | null>(null)

let nextId = 1

export function JevProvider({ children }: { children: React.ReactNode }) {
  const [showProbabilities, setShowProbabilities] = React.useState(true)
  const [calls, setCalls] = React.useState<JevCall[]>([])
  const [mode, setMode] = React.useState<JevSource | null>(null)

  React.useEffect(() => {
    fetch("/api/jev")
      .then((res) => res.json())
      .then((data: { mode: JevSource }) => setMode(data.mode))
      .catch(() => setMode("fallback"))
  }, [])

  const record = React.useCallback(
    (useCase: string, response: JevResponse, roundTripMs: number) => {
      setCalls((prev) =>
        [
          {
            id: nextId++,
            useCase,
            latencyMs: response.latencyMs,
            roundTripMs,
            source: response.source,
            questions: response.questions.length,
            at: Date.now(),
          },
          ...prev,
        ].slice(0, 50)
      )
    },
    []
  )

  const value = React.useMemo(
    () => ({ showProbabilities, setShowProbabilities, mode, calls, record }),
    [showProbabilities, mode, calls, record]
  )

  return <JevContext.Provider value={value}>{children}</JevContext.Provider>
}

export function useJevContext() {
  const context = React.useContext(JevContext)
  if (!context) throw new Error("useJevContext must be used within JevProvider")
  return context
}
