
import React, { useState, useEffect, useRef } from 'react';
import { searchDiagnostics } from '@/utils/search-diagnostics';

export const SearchDiagnosticsPanel = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const logsRef = useRef<HTMLDivElement>(null);

  // Override console methods to capture logs
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      setLogs(prev => [...prev, `LOG: ${JSON.stringify(args)}`]);
    };

    console.error = (...args) => {
      originalError(...args);
      setLogs(prev => [...prev, `ERROR: ${JSON.stringify(args)}`]);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      setLogs(prev => [...prev, `WARN: ${JSON.stringify(args)}`]);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="fixed bottom-0 right-0 w-96 h-64 bg-black/90 text-green-400 p-4 font-mono text-xs overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white">Search Diagnostics</h3>
        <button 
          onClick={() => setLogs([])}
          className="text-white hover:text-red-400"
        >
          Clear
        </button>
      </div>
      <div 
        ref={logsRef}
        className="h-full overflow-y-auto"
      >
        {logs.map((log, i) => (
          <div key={i} className="mb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};
