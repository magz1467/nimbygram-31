import { CheckCircle, Users, FileText } from "lucide-react";

export const Stats = () => {
  return (
    <div className="hidden md:flex gap-6 items-center justify-center mb-2">
      <div className="flex items-center gap-2 text-center">
        <CheckCircle className="text-secondary" size={20} />
        <span className="text-sm">Official data source</span>
      </div>
      <div className="flex items-center gap-2 text-center">
        <Users className="text-secondary" size={20} />
        <span className="text-sm">50k+ monthly users</span>
      </div>
      <div className="flex items-center gap-2 text-center">
        <FileText className="text-secondary" size={20} />
        <span className="text-sm">100k+ applications tracked</span>
      </div>
    </div>
  );
};