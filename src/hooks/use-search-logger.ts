
import { supabase } from "@/integrations/supabase/client";
import { getCurrentHostname, getEnvironmentName } from "@/utils/environment";

type SearchStatus = 'recent' | 'completed';

export const useSearchLogger = () => {
  const env = getEnvironmentName();
  const hostname = getCurrentHostname();

  const logSearch = async (postcode: string, status: SearchStatus) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Log to console for debugging
      console.log(`[useSearchLogger][${env}][${hostname}] 📝 Logging search: ${postcode} with status: ${status}`);
      
      // Check if the RPC function exists
      console.log(`[useSearchLogger][${env}] Checking if get_nearby_applications RPC function exists...`);
      try {
        const { data: testData, error: testError } = await supabase
          .rpc('get_nearby_applications', {
            center_lat: 51.5074,
            center_lng: -0.1278,
            radius_km: 1,
            result_limit: 1
          });
          
        if (testError) {
          console.log(`[useSearchLogger][${env}] 🔴 RPC function test failed:`, testError.message);
        } else {
          console.log(`[useSearchLogger][${env}] ✅ RPC function exists and works`, 
            testData ? `(returned ${testData.length} results)` : '(returned no results)');
        }
      } catch (rpcError) {
        console.error(`[useSearchLogger][${env}] 🔴 Error testing RPC function:`, rpcError);
      }
      
      // Try both column naming conventions to handle different environments
      try {
        // First try with standard snake_case
        console.log(`[useSearchLogger][${env}] Attempting standard column format insert...`);
        const standardPayload = {
          search_term: postcode,
          status: status.toLowerCase(),
          user_logged_in: !!session?.user,
          timestamp: new Date().toISOString(),
          environment: env,
          hostname: hostname
        };
        
        console.log(`[useSearchLogger][${env}] Standard payload:`, standardPayload);
        
        const { error: standardError } = await supabase
          .from('Searches')
          .insert(standardPayload);

        if (standardError) {
          console.warn(`[useSearchLogger][${env}] 🔴 Error with standard column names:`, standardError);
          
          // If that fails, try with PascalCase convention
          console.log(`[useSearchLogger][${env}] Attempting PascalCase column format...`);
          const pascalPayload = {
            'Post Code': postcode,
            'Status': status,
            'User_logged_in': !!session?.user,
            'Timestamp': new Date().toISOString(),
            'Environment': env,
            'Hostname': hostname
          };
          
          console.log(`[useSearchLogger][${env}] PascalCase payload:`, pascalPayload);
          
          const { error: pascalError } = await supabase
            .from('Searches')
            .insert(pascalPayload);
              
          if (pascalError) {
            console.error(`[useSearchLogger][${env}] 🔴 PascalCase search logging also failed:`, pascalError);
            
            // Get table structure
            console.log(`[useSearchLogger][${env}] Attempting to get table structure...`);
            const { data: tableInfo, error: tableError } = await supabase
              .from('Searches')
              .select('*')
              .limit(1);
              
            if (tableError) {
              console.error(`[useSearchLogger][${env}] 🔴 Could not get table info:`, tableError);
            } else {
              console.log(`[useSearchLogger][${env}] 📊 Table structure from sample:`, 
                tableInfo && tableInfo.length > 0 ? Object.keys(tableInfo[0]) : 'No records');
            }
            
          } else {
            console.log(`[useSearchLogger][${env}] ✅ PascalCase search logging succeeded`);
          }
        } else {
          console.log(`[useSearchLogger][${env}] ✅ Standard search logging succeeded`);
        }
      } catch (insertError) {
        console.error(`[useSearchLogger][${env}] 🔴 Exception during search logging attempt:`, insertError);
      }
    } catch (err) {
      // More detailed error logging for debugging
      console.error(`[useSearchLogger][${env}] 🔴 Error in useSearchLogger:`, err);
    }
  };

  return { logSearch };
};
