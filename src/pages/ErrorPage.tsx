
import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Oops!</h1>
      <p className="text-xl mb-6">Sorry, an unexpected error has occurred.</p>
      <p className="text-gray-500 mb-8">
        {(error as Error)?.message || 'Unknown error occurred'}
      </p>
      <Button asChild>
        <Link to="/">Go back home</Link>
      </Button>
    </div>
  );
}
