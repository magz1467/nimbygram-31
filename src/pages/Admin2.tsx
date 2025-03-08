
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutomationControl } from "@/components/admin/AutomationControl";
import { ManualProcessing } from "@/components/admin/ManualProcessing";
import { StatusDisplay } from "@/components/admin/StatusDisplay";
import { VotesTableSetup } from "@/components/admin/VotesTableSetup";
import { SupportTableSetup } from "@/components/admin/SupportTableSetup";

export default function Admin2() {
  const [activeTab, setActiveTab] = useState("automation");
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <StatusDisplay totalAITitles={0} />
        <VotesTableSetup />
        <SupportTableSetup />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-8">
          <TabsTrigger value="automation" className="flex-1">Automation Control</TabsTrigger>
          <TabsTrigger value="manual" className="flex-1">Manual Processing</TabsTrigger>
        </TabsList>
        <TabsContent value="automation">
          <AutomationControl isGenerating={isGenerating} />
        </TabsContent>
        <TabsContent value="manual">
          <ManualProcessing 
            isGenerating={isGenerating} 
            processingBatchSize={10} 
            onGenerate={() => {}} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
