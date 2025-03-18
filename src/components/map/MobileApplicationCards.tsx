
import { Application } from "@/types/planning";
import { useState, useEffect } from "react";
import { FullScreenDetails } from "./mobile/FullScreenDetails";
import { useToast } from "@/hooks/use-toast";
import { EmptyStateWithEmail } from "./EmptyStateWithEmail";
import { MiniCard } from "./mobile/MiniCard";
import { Flame } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PlanningApplicationList } from "@/components/PlanningApplicationList";

interface MobileApplicationCardsProps {
  applications: Application[];
  selectedId: number | null;
  onSelectApplication: (id: number | null) => void;
  postcode: string;
}

export const MobileApplicationCards = ({
  applications,
  selectedId,
  onSelectApplication,
  postcode,
}: MobileApplicationCardsProps) => {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedId === null) {
      setShowFullDetails(false);
      setIsDrawerOpen(false);
    }
  }, [selectedId]);

  const handleCommentSubmit = (content: string) => {
    console.log("New comment:", content);
    toast({
      title: "Comment Submitted",
      description: "Your comment has been recorded",
    });
  };

  const selectedApp = applications.find(app => app.id === selectedId);

  if (!applications.length) {
    return <EmptyStateWithEmail postcode={postcode} />;
  }

  if (showFullDetails && selectedApp) {
    return (
      <div className="fixed inset-0 bg-white z-[2000] overflow-auto">
        <FullScreenDetails
          application={selectedApp}
          onDismiss={() => {
            setShowFullDetails(false);
            onSelectApplication(null);
          }}
          onCommentSubmit={handleCommentSubmit}
        />
      </div>
    );
  }

  if (selectedApp && !showFullDetails) {
    return (
      <MiniCard
        application={selectedApp}
        onClick={() => setShowFullDetails(true)}
      />
    );
  }

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SheetTrigger asChild>
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg rounded-t-xl cursor-pointer z-[1000] border-t">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Flame className="h-5 w-5" />
            <span className="font-semibold">See what's hot right now</span>
          </div>
          <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-2" />
        </div>
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] p-0 rounded-t-xl"
      >
        <div className="flex flex-col h-full bg-white">
          <div className="p-0.5 border-b bg-white sticky top-0">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto cursor-pointer" />
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            <PlanningApplicationList
              applications={applications}
              postcode={postcode}
              onSelectApplication={(id) => {
                onSelectApplication(id);
                setIsDrawerOpen(false);
              }}
              activeSort="newest"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
