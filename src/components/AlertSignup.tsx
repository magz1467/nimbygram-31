import { useState, useEffect } from "react"
import { useAlertSignup } from "@/hooks/useAlertSignup"
import { EmailDialog } from "./EmailDialog"
import { AlertSignupButton } from "./alerts/AlertSignupButton"
import { SubscribedAlert } from "./alerts/SubscribedAlert"
import { supabase } from "@/integrations/supabase/client"
import { AlertSignupLoggedOut } from "./alerts/AlertSignupLoggedOut"

interface AlertSignupProps {
  postcode: string
}

export const AlertSignup = ({ postcode }: AlertSignupProps) => {
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const { isSubscribed, isLoading, handleEmailSubmit } = useAlertSignup(postcode)
  const [session, setSession] = useState<any>(null)

  // Check session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (!session) {
    return <AlertSignupLoggedOut />
  }

  if (isSubscribed) {
    return <SubscribedAlert />
  }

  return (
    <>
      <AlertSignupButton 
        isSubscribed={isSubscribed}
        isLoading={isLoading}
        onClick={() => setShowEmailDialog(true)}
      />
      <EmailDialog 
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        onSubmit={handleEmailSubmit}
        postcode={postcode}
      />
    </>
  )
}