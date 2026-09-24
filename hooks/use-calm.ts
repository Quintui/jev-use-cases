"use client"

import * as React from "react"

import type { RankedOption } from "@/lib/jev/tiers"

export type CalmOptions = {
  /** A new answer must reach this to be considered. */
  enter?: number
  /** A shown answer stays until it drops below this (the buffer zone). */
  exit?: number
  /** Above this, switch immediately instead of waiting for a second win. */
  instant?: number
}

type CalmState = {
  shown: RankedOption | null
  pending: string | null
  streak: number
}

const EMPTY: CalmState = { shown: null, pending: null, streak: 0 }

function reduce(
  state: CalmState,
  ranked: RankedOption[],
  { enter = 0.6, exit = 0.4, instant = 0.9 }: CalmOptions
): CalmState {
  const probabilityOf = (key: string) =>
    ranked.find((option) => option.key === key)?.probability ?? 0

  let shown: RankedOption | null = null
  if (state.shown) {
    const p = probabilityOf(state.shown.key)
    if (p >= exit) shown = { key: state.shown.key, probability: p }
  }

  const top = ranked[0]
  if (!top || top.key === shown?.key || top.probability < enter) {
    return { shown, pending: null, streak: 0 }
  }

  // A challenger: only switch when it wins twice in a row or is very confident.
  const streak = state.pending === top.key ? state.streak + 1 : 1
  if (top.probability >= instant || streak >= 2) {
    return { shown: top, pending: null, streak: 0 }
  }
  return { shown, pending: top.key, streak }
}

/**
 * Calm UI (after Shapeshift's state machine): don't let the UI flicker as
 * the user types. `token` changes once per new Jev result.
 */
export function useCalm(
  ranked: RankedOption[],
  token: unknown,
  options: CalmOptions = {}
) {
  const [state, setState] = React.useState(EMPTY)
  const [prevToken, setPrevToken] = React.useState(token)

  if (token !== prevToken) {
    setPrevToken(token)
    setState(reduce(state, ranked, options))
  }

  return state
}
