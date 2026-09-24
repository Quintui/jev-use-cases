import { evaluateUseCase, jevMode } from "@/lib/jev/server"
import { useCases, type UseCaseId } from "@/lib/jev/use-cases"

export async function POST(request: Request) {
  const { useCase, input } = (await request.json()) as {
    useCase: string
    input: unknown
  }

  if (!(useCase in useCases)) {
    return Response.json({ error: `Unknown use case "${useCase}"` }, { status: 400 })
  }

  try {
    const result = await evaluateUseCase(
      useCase as UseCaseId,
      input as never,
      request.signal
    )
    return Response.json(result)
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 })
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ mode: jevMode() })
}
