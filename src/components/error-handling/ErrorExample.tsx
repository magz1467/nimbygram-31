
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ApplicationErrorBoundary } from './ApplicationErrorBoundary';
import { useGlobalErrorHandler } from '@/hooks/use-global-error-handler';
import { tryCatch } from '@/utils/errors/async-error-handler';

// Example component that demonstrates error handling
export function ErrorHandlingExample() {
  const [count, setCount] = useState(0);
  const errorHandler = useGlobalErrorHandler();
  
  // Example function that might throw an error
  const maybeThrowError = () => {
    if (Math.random() > 0.5) {
      throw new Error('This is a simulated error');
    }
    return 'Success!';
  };
  
  // Example of handling synchronous errors
  const handleSyncError = () => {
    try {
      const result = maybeThrowError();
      alert(`Operation successful: ${result}`);
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'sync operation example',
        userMessage: 'The operation failed, but we handled it gracefully.'
      });
    }
  };
  
  // Example of handling async errors
  const handleAsyncError = async () => {
    // Simulated API call that might fail
    const simulateApiCall = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (Math.random() > 0.5) {
        throw new Error('API call failed');
      }
      return { data: 'API data received' };
    };
    
    const [result, error] = await tryCatch(
      simulateApiCall,
      null,
      { 
        context: 'API call example',
        retry: true,
        maxRetries: 2 
      }
    );
    
    if (error) {
      errorHandler.handleError(error, {
        context: 'async operation example'
      });
      return;
    }
    
    alert(`API call succeeded: ${result?.data}`);
  };
  
  // Example that definitely throws an error
  const throwUnhandledError = () => {
    throw errorHandler.createError('This error was explicitly thrown', {
      type: errorHandler.ErrorType.VALIDATION,
      userMessage: 'This is a demonstration of an unhandled error that gets caught by the ErrorBoundary'
    });
  };

  return (
    <ApplicationErrorBoundary component="ErrorHandlingExample">
      <div className="p-6 border rounded-lg space-y-4">
        <h2 className="text-xl font-bold">Error Handling Examples</h2>
        
        <div className="space-y-2">
          <p>Counter: {count}</p>
          <Button onClick={() => setCount(count + 1)}>Increment (Safe)</Button>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold">Error Handling Demos:</h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={handleSyncError}
            >
              Try Sync Operation (50% Chance of Error)
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleAsyncError}
            >
              Try Async Operation (50% Chance of Error)
            </Button>
            
            <Button 
              variant="destructive"
              onClick={throwUnhandledError}
            >
              Throw Unhandled Error (Will Trigger ErrorBoundary)
            </Button>
          </div>
        </div>
      </div>
    </ApplicationErrorBoundary>
  );
}
