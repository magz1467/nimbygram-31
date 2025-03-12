
export const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => {
        const error = new Error(timeoutMessage);
        error['type'] = 'TIMEOUT';
        reject(error);
      }, timeoutMs)
    )
  ]) as Promise<T>;
};
