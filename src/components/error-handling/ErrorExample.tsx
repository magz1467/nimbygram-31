
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { ApplicationErrorBoundary } from './ApplicationErrorBoundary';
import { createAppError, ErrorType } from '@/utils/errors';

export const ErrorExample = () => {
  const [showError, setShowError] = useState(false);
  
  const triggerNetworkError = () => {
    throw createAppError(
      "Unable to connect to the server",
      null,
      { type: ErrorType.NETWORK }
    );
  };
  
  const triggerTimeoutError = () => {
    throw createAppError(
      "The operation took too long to complete",
      null,
      { type: ErrorType.TIMEOUT }
    );
  };
  
  const triggerReferenceError = () => {
    // @ts-expect-error - Intentionally accessing undefined variable
    console.log(undefinedVariable);
  };
  
  const triggerTypeError = () => {
    // Safely create an object that we know is not iterable
    const nonIterableObject = { data: "string" };
    // @ts-expect-error - Intentionally treating non-iterable as iterable
    for (const item of nonIterableObject) {
      console.log(item);
    }
  };
  
  const triggerContextError = () => {
    // Create context with invalid value
    const context: Record<string, any> = {};
    // @ts-expect-error - Intentionally assigning string to Record
    context = "Invalid context";
    console.log(context);
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Error Handling Examples</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trigger Errors</CardTitle>
            <CardDescription>Click the buttons below to trigger different types of errors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="destructive" onClick={triggerNetworkError}>Network Error</Button>
            <Button variant="destructive" onClick={triggerTimeoutError}>Timeout Error</Button>
            <Button variant="destructive" onClick={triggerReferenceError}>Reference Error</Button>
            <Button variant="destructive" onClick={triggerTypeError}>Type Error</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Error Boundary Example</CardTitle>
            <CardDescription>Error boundaries catch errors in child components</CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationErrorBoundary>
              {showError ? (
                <div>
                  {/* This will throw an error */}
                  {triggerNetworkError()}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Click the button to show an error</AlertTitle>
                  <AlertDescription>
                    The error will be caught by the error boundary.
                  </AlertDescription>
                </Alert>
              )}
            </ApplicationErrorBoundary>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setShowError(!showError)}>
              {showError ? "Reset" : "Show Error"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ErrorExample;
