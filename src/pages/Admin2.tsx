import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Application } from '@/types/planning';

// Component to display status information
const StatusDisplay = ({
  totalApplications,
  totalAITitles,
  totalImpactScores,
  lastUpdated,
  totalMapImages,
  recentTitles,
  recentScores,
}: {
  totalApplications: number;
  totalAITitles: number;
  totalImpactScores: number;
  lastUpdated: string;
  totalMapImages: number;
  recentTitles: { id: number; title: string }[];
  recentScores: { id: number; score: number }[];
}) => {
  return (
    <div>
      <p>Total Applications: {totalApplications}</p>
      <p>Total AI Titles: {totalAITitles}</p>
      <p>Total Impact Scores: {totalImpactScores}</p>
      <p>Total Map Images: {totalMapImages}</p>
      <p>Last Updated: {new Date(lastUpdated).toLocaleString()}</p>
      
      {recentTitles.length > 0 && (
        <div>
          <p>Recent AI Titles:</p>
          <ul>
            {recentTitles.map(item => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        </div>
      )}
      
      {recentScores.length > 0 && (
        <div>
          <p>Recent Impact Scores:</p>
          <ul>
            {recentScores.map(item => (
              <li key={item.id}>Application {item.id}: {item.score}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Component to control automation processing
const AutomationControl = ({
  isGenerating,
  onSetGenerating,
}: {
  isGenerating: boolean;
  onSetGenerating: (generating: boolean) => void;
}) => {
  return (
    <div>
      <button
        onClick={() => onSetGenerating(!isGenerating)}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Start Generating'}
      </button>
    </div>
  );
};

// Component for manual processing controls
const ManualProcessing = ({
  isGenerating,
  processingBatchSize,
  onGenerate,
  onSetBatchSize,
}: {
  isGenerating: boolean;
  processingBatchSize: number;
  onGenerate: () => Promise<void>;
  onSetBatchSize: (size: number) => void;
}) => {
  return (
    <div>
      <input
        type="number"
        value={processingBatchSize}
        onChange={(e) => onSetBatchSize(Number(e.target.value))}
        placeholder="Batch Size"
      />
      <button onClick={onGenerate} disabled={isGenerating}>
        Generate
      </button>
    </div>
  );
};

const Admin2 = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchSize, setBatchSize] = useState(5);
  const [applicationCounts, setApplicationCounts] = useState({
    totalApplications: 0,
    totalAITitles: 0,
    totalImpactScores: 0,
    lastUpdated: new Date().toISOString(),
    totalMapImages: 0,
    recentTitles: [],
    recentScores: [],
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchApplicationCounts();
  }, []);

  const fetchApplicationCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('application_counts')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching application counts:', error);
        toast({
          title: "Error fetching counts",
          description: "Failed to retrieve application statistics.",
          variant: "destructive"
        });
        return;
      }

      setApplicationCounts(data || {
        totalApplications: 0,
        totalAITitles: 0,
        totalImpactScores: 0,
        lastUpdated: new Date().toISOString(),
        totalMapImages: 0,
        recentTitles: [],
        recentScores: [],
      });
    } catch (err) {
      console.error('Unexpected error fetching counts:', err);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred while fetching application statistics.",
        variant: "destructive"
      });
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-data', {
        body: {
          batchSize: batchSize,
        },
      });

      if (error) {
        console.error('Function invocation error:', error);
        toast({
          title: "Function error",
          description: `Failed to generate AI data: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('Function result:', data);
        toast({
          title: "Generation complete",
          description: "AI data generation completed successfully.",
        });
      }
    } catch (err) {
      console.error('Unexpected error during function invocation:', err);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred during AI data generation.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      fetchApplicationCounts();
    }
  };
  
  // Sample data for status display - these values should be replaced with actual data
  const statusDisplayProps = {
    totalApplications: applicationCounts.totalApplications || 0,
    totalAITitles: applicationCounts.totalAITitles || 0,
    totalImpactScores: applicationCounts.totalImpactScores || 0,
    lastUpdated: applicationCounts.lastUpdated || new Date().toISOString(),
    totalMapImages: applicationCounts.totalMapImages || 0,
    recentTitles: applicationCounts.recentTitles || [],
    recentScores: applicationCounts.recentScores || [],
  };

  // Processing props
  const processingProps = {
    isGenerating: isGenerating,
    onSetGenerating: setIsGenerating
  };

  // Manual processing props
  const manualProcessingProps = {
    isGenerating: isGenerating,
    processingBatchSize: batchSize,
    onGenerate: handleGenerate,
    onSetBatchSize: setBatchSize
  };
  
  return (
    <div className="container p-4 mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      
      {/* Status section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">System Status</h2>
        <StatusDisplay {...statusDisplayProps} />
      </div>
      
      {/* Control section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">Automation Control</h2>
        <AutomationControl {...processingProps} />
      </div>
      
      {/* Processing section */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-3">Manual Processing</h2>
        <ManualProcessing {...manualProcessingProps} />
      </div>
    </div>
  );
};

export default Admin2;
