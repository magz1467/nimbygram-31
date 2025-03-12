
export const logCoordinatesOperation = (operation: string, details: any) => {
  console.log(`📍 Coordinates ${operation}:`, details);
};

export const logCoordinatesError = (error: any, context?: any) => {
  console.error("❌ Coordinates error:", error.message, context);
};
