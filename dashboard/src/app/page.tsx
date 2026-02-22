"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import TopBar, { TABS } from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import ModuleFrame from "@/components/ModuleFrame";
import StatusBar from "@/components/StatusBar";

export default function Home() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const agents = useQuery(api.agents.list);
  const seed = useMutation(api.agents.seed);

  useEffect(() => {
    if (agents && agents.length === 0) seed();
  }, [agents, seed]);

  const currentTab = useMemo(() => TABS.find((t) => t.id === activeTab) || TABS[0], [activeTab]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex min-h-0">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <ModuleFrame
          key={currentTab.id}
          tabId={currentTab.id}
          port={currentTab.port}
          label={currentTab.label}
          emoji={currentTab.emoji}
        />
      </div>

      <StatusBar />
    </div>
  );
}
