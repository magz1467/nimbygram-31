
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

  // Display toast for significant errors only
  if (!errorMessage.includes('get_nearby_applications') && 
      !errorMessage.includes('Could not find the function')) {
    toast({
      title: "Map Error",
      description: errorMessage,
      variant: "destructive",
    })
  }

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
