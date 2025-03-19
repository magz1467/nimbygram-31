
import React from "react";
import { AreaUpdatesCard } from "@/components/stay-up-to-date/AreaUpdatesCard";
import { NewsletterCard } from "@/components/stay-up-to-date/NewsletterCard";
import { SocialMediaCard } from "@/components/stay-up-to-date/SocialMediaCard";

export const StayUpToDate = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Stay Up To Date</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Never miss an important planning application or development update in your area
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AreaUpdatesCard />
          <NewsletterCard />
          <SocialMediaCard />
        </div>
      </div>
    </section>
  );
};

export default StayUpToDate;
