import Image from "@/components/ui/image";

export const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 shadow-2xl max-w-2xl mx-4 relative overflow-hidden">
        {/* Gradient background effect with warmer tones */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FEC6A1] via-white to-white opacity-50" />
        
        <div className="relative flex flex-col items-center gap-8">
          {/* Comic style image - made much bigger */}
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <Image 
              src="/lovable-uploads/a8a9d54b-25b5-4131-a1c4-6efb44c62d0f.png"
              alt="Planning Pulse Logo"
              className="w-64 h-64 rounded-full object-cover border-4 border-primary animate-pulse"
              width={256}
              height={256}
            />
          </div>

          {/* Loading message with comic-style typography */}
          <div className="space-y-4 text-center">
            <h3 className="text-3xl font-bold text-gray-800 font-serif">
              Unlocking your inner Nimby
            </h3>
            <p className="text-sm text-gray-600 max-w-sm font-medium">
              We're gathering the latest planning applications in your area
            </p>
          </div>

          {/* Stylized loading spinner */}
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mt-2" 
               style={{
                 boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1), 0 2px 4px -1px rgba(16, 185, 129, 0.06)'
               }}
          />
        </div>
      </div>
    </div>
  );
};