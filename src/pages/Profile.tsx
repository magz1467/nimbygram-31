import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { SavedApplicationsTab } from "@/components/profile/SavedApplicationsTab";
import { PetitionsTab } from "@/components/profile/PetitionsTab";
import { ActivityTab } from "@/components/profile/ActivityTab";
import { SettingsTab } from "@/components/profile/SettingsTab";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data: profile, error } = await supabase
        .from('User_data')
        .select('*')
        .eq('Email', session.user.email)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
        return;
      }

      if (!profile) {
        console.warn('No user profile found');
        toast({
          title: "Warning",
          description: "User profile not found",
          variant: "destructive",
        });
        return;
      }

      setUserProfile(profile);
    } else {
      navigate('/');
    }
  };

  const handlePostcodeUpdate = async (postcode: string) => {
    try {
      const { error } = await supabase
        .from('User_data')
        .update({ "Post Code": postcode })
        .eq('Email', user.email);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Postcode updated successfully",
      });
    } catch (error) {
      console.error('Error updating postcode:', error);
      toast({
        title: "Error",
        description: "Failed to update postcode",
        variant: "destructive",
      });
    }
  };

  const handleMarketingUpdate = async (value: boolean) => {
    try {
      const { error } = await supabase
        .from('User_data')
        .update({ Marketing: value })
        .eq('Email', user.email);

      if (error) throw error;

      setUserProfile({ ...userProfile, Marketing: value });
      toast({
        title: "Success",
        description: "Marketing preferences updated successfully",
      });
    } catch (error) {
      console.error('Error updating marketing preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update marketing preferences",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <ProfileHeader user={user} />
        <div className="mt-8">
          <ProfileTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            user={user}
            userProfile={userProfile}
            petitions={[]}
            onPostcodeUpdate={handlePostcodeUpdate}
            onEmailSubmit={async () => {}}
            onMarketingUpdate={handleMarketingUpdate}
            onSignOut={handleSignOut}
            onInterestTypeUpdate={async () => {}}
          />
          <div className="mt-6">
            {activeTab === "overview" && (
              <ProfileOverview 
                user={user}
                userProfile={userProfile}
                onPostcodeUpdate={handlePostcodeUpdate}
                onInterestTypeUpdate={async () => {}}
              />
            )}
            {activeTab === "saved" && <SavedApplicationsTab onSelectApplication={() => {}} />}
            {activeTab === "petitions" && <PetitionsTab petitions={[]} />}
            {activeTab === "activity" && <ActivityTab userId={user?.id} />}
            {activeTab === "settings" && (
              <SettingsTab 
                userProfile={userProfile}
                onMarketingUpdate={handleMarketingUpdate}
                onSignOut={handleSignOut}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Profile;