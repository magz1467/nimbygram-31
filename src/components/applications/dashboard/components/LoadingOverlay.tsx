
import Image from "@/components/ui/image";
import "../../../styles/components/loading-overlay.css";

export const LoadingOverlay = () => {
  return (
    <div className="loading-overlay">
      <div className="bg-white rounded-xl p-8 shadow-2xl max-w-2xl mx-4 relative overflow-hidden">
        <div className="loading-content absolute inset-0" />
        
        <div className="relative flex flex-col items-center gap-8">
          <div className="loading-image-container">
            <div className="loading-pulse" />
            <Image 
              src="/lovable-uploads/a8a9d54b-25b5-4131-a1c4-6efb44c62d0f.png"
              alt="Planning Pulse Logo"
              className="loading-image rounded-full object-cover border-4 border-primary animate-pulse"
              width={256}
              height={256}
            />
          </div>

          <div className="space-y-4 text-center">
            <h3 className="text-3xl font-bold text-gray-800 font-serif">
              Unlocking your inner Nimby
            </h3>
            <p className="text-sm text-gray-600 max-w-sm font-medium">
              We're gathering the latest planning applications in your area
            </p>
          </div>

          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    </div>
  );
};
