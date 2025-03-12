
import { toast } from "@/components/ui/use-toast"

type ErrorDetails = {
  message: string
  code?: string
}

function logError(error: unknown): void {
  console.error("An unexpected error occurred:", error)
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message)
  }
  return "An unexpected error occurred."
}

export function handleMapError(error: unknown): string {
  let errorMessage = "An unexpected error occurred."

  if (error instanceof Error) {
    errorMessage = error.message
  } else if (typeof error === "string") {
    errorMessage = error
  }

  logError(error)

  return getErrorMessage(error)
}

export function displayMapError(error: unknown) {
  const errorMessage = handleMapError(error)

  toast({
    title: "Map Error",
    description: errorMessage,
    variant: "destructive",
  })
}
