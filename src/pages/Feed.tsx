
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Heart, MessageSquare, Share2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PropertyListing {
  id: number;
  url_documents: string;
  pdf_urls: string[];
  last_scraped_at: string;
}

export default function Feed() {
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('property_data_api')
        .select('*')
        .order('last_scraped_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setListings(data || []);
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Failed to load property listings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-center mb-8">Property Feed</h1>
      <div className="space-y-6">
        {listings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <p className="font-semibold">Property #{listing.id}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>Location</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Image */}
            <div className="aspect-square bg-gray-100 relative">
              {listing.pdf_urls && listing.pdf_urls.length > 0 ? (
                <img
                  src="/placeholder.svg"
                  alt={`Property ${listing.id}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No images available
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>

            {/* Details */}
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-600">
                Last updated: {new Date(listing.last_scraped_at).toLocaleDateString()}
              </p>
              <a 
                href={listing.url_documents}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm mt-2 inline-block"
              >
                View Documents
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
