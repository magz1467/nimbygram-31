
import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { StatusDisplay } from "@/components/admin/StatusDisplay";
import { AutomationControl } from "@/components/admin/AutomationControl";
import { ManualProcessing } from "@/components/admin/ManualProcessing";
import { VotesTableSetup } from "@/components/admin/VotesTableSetup";

const Admin2 = () => {
  const [activeTab, setActiveTab] = useState("status");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "status" ? "default" : "outline"}
            onClick={() => setActiveTab("status")}
          >
            Status
          </Button>
          <Button
            variant={activeTab === "automation" ? "default" : "outline"}
            onClick={() => setActiveTab("automation")}
          >
            Automation
          </Button>
          <Button
            variant={activeTab === "processing" ? "default" : "outline"}
            onClick={() => setActiveTab("processing")}
          >
            Processing
          </Button>
          <Button
            variant={activeTab === "setup" ? "default" : "outline"}
            onClick={() => setActiveTab("setup")}
          >
            Setup
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          {activeTab === "status" && <StatusDisplay />}
          {activeTab === "automation" && <AutomationControl />}
          {activeTab === "processing" && <ManualProcessing />}
          {activeTab === "setup" && <div>
            <VotesTableSetup />
          </div>}
        </div>
      </main>
    </div>
  );
};

export default Admin2;
