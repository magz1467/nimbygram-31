
# Search Diagnostics for Claude Analysis

This document explains how to use the search diagnostic tools to analyze and troubleshoot search functionality with Claude or other AI assistants.

## Exporting Search Diagnostics to Claude

The `search-diagnostics.ts` file exports core search functions, hooks, types, and logging functions that you can use to analyze the search functionality. To export this to Claude:

1. Copy the relevant code from these files:
   - `src/utils/search-diagnostics.ts`
   - `src/hooks/planning/search/types.ts`
   - `src/hooks/planning/search/search-executor.ts`
   - `src/hooks/planning/use-planning-search.ts`
   - `src/hooks/planning/search/use-search-state-manager.ts`

2. Paste the code into a Claude chat, along with a specific question about what you want to analyze or troubleshoot.

Example: "Claude, here's my search implementation code. Can you help me understand why searches are taking so long to complete?"

## Using the SearchDiagnosticsPanel

The `SearchDiagnosticsPanel` component provides a way to visualize search operations in real-time:

1. Import and add the component to your app:

```jsx
import { SearchDiagnosticsPanel } from '@/components/diagnostics/SearchDiagnosticsPanel';

// Add it at the bottom of your app component
function App() {
  return (
    <>
      {/* Your application components */}
      <SearchDiagnosticsPanel />
    </>
  );
}
```

2. The panel will show:
   - All console logs, errors, and warnings
   - Search progress events
   - Performance metrics

3. You can take screenshots of the panel during problematic searches and share them with Claude or other analysts.

## Collecting Raw Console Logs

If you want to collect raw logs for Claude to analyze:

1. Open your browser's developer console
2. Run a search that's exhibiting the issue
3. Right-click in the console and select "Save as..." to export the logs
4. Clean up the log file to focus on relevant parts, removing any sensitive data
5. Share the logs with Claude

## Using the Diagnostic API Functions

The diagnostic API functions (in `search-diagnostics.ts`) can be used to log specific search events:

```javascript
import { searchDiagnostics } from '@/utils/search-diagnostics';

// Log search parameters
searchDiagnostics.logSearchState({
  coordinates: [51.5074, -0.1278],
  radius: 5,
  filters: { status: 'Pending' }
});

// Log errors
try {
  // Search code
} catch (error) {
  searchDiagnostics.logSearchError(error);
}
```

Collect these logs and share them with Claude for analysis.
