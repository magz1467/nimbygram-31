
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Cache the column check result globally
const columnCheckCache: Record<string, boolean> = {};

export const useColumnExists = (tableName: string, columnName: string) => {
  const [exists, setExists] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const cacheKey = `${tableName}:${columnName}`;

  useEffect(() => {
    const checkColumn = async () => {
      // Check cache first
      if (cacheKey in columnCheckCache) {
        setExists(columnCheckCache[cacheKey]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('check_column_exists', {
          table_name: tableName,
          column_name: columnName
        });

        if (error) {
          console.warn(`Could not check if column ${columnName} exists in ${tableName}:`, error);
          setExists(false);
        } else {
          setExists(!!data);
        }

        // Cache the result
        columnCheckCache[cacheKey] = !!data;
      } catch (err) {
        console.warn(`Error checking if column ${columnName} exists in ${tableName}:`, err);
        setExists(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkColumn();
  }, [tableName, columnName, cacheKey]);

  return { exists, isLoading };
};
