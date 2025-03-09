
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutomationControl } from "@/components/admin/AutomationControl";
import { ManualProcessing } from "@/components/admin/ManualProcessing";
import { StatusDisplay } from "@/components/admin/StatusDisplay";
import { SupportTableSetup } from "@/components/admin/SupportTableSetup";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Admin2() {
  const [activeTab, setActiveTab] = useState("setup");
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Before using the application, you must set up the required database tables using the tools below.
          Click on the "Create Application Support Table" button to set up the table.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <StatusDisplay totalAITitles={0} />
        <SupportTableSetup />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-8">
          <TabsTrigger value="setup" className="flex-1">Database Setup</TabsTrigger>
          <TabsTrigger value="automation" className="flex-1">Automation Control</TabsTrigger>
          <TabsTrigger value="manual" className="flex-1">Manual Processing</TabsTrigger>
        </TabsList>
        <TabsContent value="setup">
          <div className="grid grid-cols-1 gap-8">
            <SupportTableSetup />
          </div>
        </TabsContent>
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
