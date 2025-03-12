
import { useState, useEffect } from "react";
import { User } from "@supabase/auth-helpers-react";
import { useSupportCount } from "./use-support-count";
import { useUserSupport } from "./use-user-support";
import { useColumnExists } from "./use-column-exists";

export const useSupportState = (applicationId: number, user: User | null) => {
  const { supportCount } = useSupportCount(applicationId);
  const { isSupportedByUser } = useUserSupport(applicationId, user);
  const { exists: columnExists } = useColumnExists('crystal_roof', 'support_count');

  // This ensures backward compatibility with the original hook
  return {
    supportCount: columnExists ? supportCount : 0,
    isSupportedByUser: columnExists ? isSupportedByUser : false
  };
};
