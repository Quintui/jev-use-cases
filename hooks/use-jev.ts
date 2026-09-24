"use client"

import * as React from "react"

import { useJevContext } from "@/components/jev/jev-provider"
import type { JevResponse } from "@/lib/jev/types"
import type { JevInput, UseCaseId } from "@/lib/jev/use-cases"

export type JevResult = JevResponse & { roundTripMs: number }

async function post<K extends UseCaseId>(
  useCase: K,
  input: JevInput<K>,
  signal?: AbortSignal
): Promise<JevResult> {
  const start = performance.now()
  const res = await fetch("/api/jev", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ useCase, input }),
    signal,
  })
  if (!res.ok) throw new Error((await res.json()).error ?? res.statusText)
  const data = (await res.json()) as JevResponse
  return { ...data, roundTripMs: performance.now() - start }
}

/** One-off calls (on Enter, on a timer, in batches). */
export function useJevAction() {
  const { record } = useJevContext()
  return React.useCallback(
    async <K extends UseCaseId>(
      useCase: K,
      input: JevInput<K>,
      signal?: AbortSignal
    ) => {
      const result = await post(useCase, input, signal)
      record(useCase, result, result.roundTripMs)
      return result
    },
    [record]
  )
}

/**
 * Runs a use case as the input changes (debounced, latest wins).
 * Pass `null` to skip. Previous data stays visible while typing so the
 * UI doesn't flicker.
 */
export function useJev<K extends UseCaseId>(
  useCase: K,
  input: JevInput<K> | null,
  { debounceMs = 120 }: { debounceMs?: number } = {}
) {
  const run = useJevAction()
  const [state, setState] = React.useState<{
    data?: JevResult
    key?: string
    isLoading: boolean
    error?: string
  }>({ isLoading: false })
  const key = input == null ? null : JSON.stringify(input)

  React.useEffect(() => {
    if (key == null) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setState((s) => ({ ...s, isLoading: true }))
      try {
        const data = await run(useCase, JSON.parse(key), controller.signal)
        setState({ data, key, isLoading: false })
      } catch (error) {
        if (controller.signal.aborted) return
        setState((s) => ({
          ...s,
          isLoading: false,
          error: error instanceof Error ? error.message : String(error),
        }))
      }
    }, debounceMs)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [useCase, key, debounceMs, run])

  return {
    data: key == null ? undefined : state.data,
    /** True when the data belongs to the current input. */
    isFresh: state.key === key,
    isLoading: state.isLoading,
    error: state.error,
  }
}
