"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { useJevContext } from "@/components/jev/jev-provider"
import type { JevResult } from "@/hooks/use-jev"
import { TIER_LABEL, formatPercent, tierOf } from "@/lib/jev/tiers"
import type { JevSource } from "@/lib/jev/types"

export const SOURCE_LABEL: Record<JevSource, string> = {
  jev: "Jev live",
  openrouter: "Jev via OpenRouter",
  gateway: "Jev via AI Gateway",
  fallback: "Keyword fallback",
}

/** Only rendered when "Show probabilities" is on, like Shapeshift's ?debug=1. */
export function DebugOnly({ children }: { children: React.ReactNode }) {
  const { showProbabilities } = useJevContext()
  return showProbabilities ? children : null
}

export function TierBadge({
  probability,
  label,
  className,
}: {
  probability: number
  label?: string
  className?: string
}) {
  const tier = tierOf(probability)
  return (
    <Badge
      variant={tier === "high" ? "default" : tier === "medium" ? "secondary" : "outline"}
      className={cn("tabular-nums", className)}
    >
      {label ?? TIER_LABEL[tier]} {formatPercent(probability)}
    </Badge>
  )
}

export function ProbabilityBars({
  options,
  highlight,
  className,
}: {
  options: { key: string; label: React.ReactNode; probability: number }[]
  highlight?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {options.map((option) => (
        <Progress
          key={option.key}
          size="sm"
          value={Math.round(option.probability * 100)}
          className={cn(highlight && option.key !== highlight && "opacity-60")}
        >
          <ProgressLabel>{option.label}</ProgressLabel>
          <ProgressValue />
        </Progress>
      ))}
    </div>
  )
}

export function ScoreMeter({
  score,
  levels,
  label,
}: {
  score: number
  levels: string[]
  label: string
}) {
  const nearest = levels[Math.round(score)] ?? ""
  return (
    <div className="flex flex-col gap-2">
      <Progress size="sm" value={(score / (levels.length - 1)) * 100}>
        <ProgressLabel>{label}</ProgressLabel>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {score.toFixed(2)} / {levels.length - 1}
        </span>
      </Progress>
      <div className="flex justify-between gap-2 text-xs text-muted-foreground">
        {levels.map((level, i) => (
          <span
            key={level}
            className={cn(
              "flex-1 truncate text-center first:text-left last:text-right",
              Math.round(score) === i && "font-medium text-foreground"
            )}
          >
            {level}
          </span>
        ))}
      </div>
      <p className="sr-only">Closest level: {nearest}</p>
    </div>
  )
}

/** Source, model latency and question count for the last call. */
export function JevMeta({
  result,
  isLoading,
  className,
}: {
  result?: JevResult
  isLoading?: boolean
  className?: string
}) {
  const { showProbabilities } = useJevContext()
  if (!showProbabilities) return null
  return (
    <div
      className={cn(
        "flex min-h-5 flex-wrap items-center gap-2 text-xs text-muted-foreground tabular-nums",
        className
      )}
    >
      {result && (
        <>
          <Badge variant="outline">{SOURCE_LABEL[result.source]}</Badge>
          <span>{Math.round(result.latencyMs)} ms model</span>
          <span>·</span>
          <span>{Math.round(result.roundTripMs)} ms round trip</span>
          <span>·</span>
          <span>
            {result.questions.length}{" "}
            {result.questions.length === 1 ? "question" : "questions"} in 1 call
          </span>
        </>
      )}
      {isLoading && <Spinner />}
    </div>
  )
}
