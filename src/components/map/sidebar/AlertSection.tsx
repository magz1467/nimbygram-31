import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMapViewStore } from '../../../store/mapViewStore';

interface AlertSectionProps {
  postcode: string;
  onShowEmailDialog: () => void;
}

export const AlertSection = ({ postcode, onShowEmailDialog }: AlertSectionProps) => {
  const [session, setSession] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { setMapView } = useMapViewStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleViewToggle = () => {
    console.log("Setting map view to false from AlertSection");
    setMapView(false);
  };

  return (
    <div className="p-4 border-b bg-white">
      <div className="flex items-center justify-between p-3 bg-[#f6c8cc]/20 rounded-lg">
        <div className="flex items-center gap-2">
          <BellRing className="text-[#af5662]" size={16} />
          <h3 className="font-playfair font-bold text-[#af5662]">🔥 💬 What's got the neighbourhood talking near you</h3>
        </div>
        {session ? (
          <Button 
            size="sm"
            variant="outline"
            className="h-8 border-[#f6c8cc] hover:bg-[#f6c8cc]/20 hover:text-[#af5662] text-[#af5662]"
            onClick={onShowEmailDialog}
          >
            <BellRing className="h-4 w-4" />
          </Button>
        ) : (
          <Link 
            to="/auth" 
            state={{ from: location.pathname, postcode: postcode }}
          >
            <Button 
              size="sm"
              variant="outline"
              className="h-8 border-[#f6c8cc] hover:bg-[#f6c8cc]/20 hover:text-[#af5662] text-[#af5662]"
            >
              <BellRing className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};