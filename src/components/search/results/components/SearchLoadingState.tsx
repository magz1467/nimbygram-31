
import { Progress } from "@/components/ui/progress";
import { LoadingSkeletons } from "./LoadingSkeletons";
import { SearchStage, getStageLabel } from "@/hooks/search/use-search-stage";

interface SearchLoadingStateProps {
  stage: SearchStage;
  progress: number;
  searchTerm: string;
  displayTerm?: string;
}

export const SearchLoadingState = ({ 
  stage, 
  progress, 
  searchTerm, 
  displayTerm 
}: SearchLoadingStateProps) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">{getStageLabel(stage)}</h2>
      <p className="text-gray-600 mb-6">
        Looking for planning applications near {displayTerm || searchTerm}
      </p>
      
      <div className="mb-8">
        <Progress value={progress} className="h-2 mb-2" />
        <p className="text-sm text-gray-500 text-right">{Math.round(progress)}%</p>
      </div>
      
      <LoadingSkeletons count={5} isLongSearch={stage === 'searching'} />
    </div>
  );
};
