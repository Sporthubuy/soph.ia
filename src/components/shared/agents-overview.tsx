"use client";

import { useState } from "react";

export const AgentsOverview = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const agents = [
    {
      id: 1,
      name: "Research Assistant Bot",
      description: "Analyzes deep learning research and provides insights on neural architectures",
      status: "running",
      knowledgeSize: 128,
      lastRun: "2 hours ago",
      latency: "124ms",
      accuracy: 96.5,
      tokensUsed: 12450,
      model: "Claude 3.5 Sonnet",
      owner: "Alex Rivers",
      createdAt: "1 month ago",
      updatedAt: "2 hours ago",
    },
    {
      id: 2,
      name: "Customer Support Agent",
      description: "Handles customer inquiries and provides onboarding assistance 24/7",
      status: "running",
      knowledgeSize: 85,
      lastRun: "5 minutes ago",
      latency: "256ms",
      accuracy: 92.1,
      tokensUsed: 28900,
      model: "Claude 3.5 Sonnet",
      owner: "Sarah Chen",
      createdAt: "3 weeks ago",
      updatedAt: "5 minutes ago",
    },
    {
      id: 3,
      name: "Compliance Auditor",
      description: "Verifies organizational compliance with GDPR and regulatory standards",
      status: "running",
      knowledgeSize: 156,
      lastRun: "1 day ago",
      latency: "89ms",
      accuracy: 99.8,
      tokensUsed: 5340,
      model: "Claude 3.5 Sonnet",
      owner: "Jordan Martinez",
      createdAt: "2 months ago",
      updatedAt: "1 day ago",
    },
    {
      id: 4,
      name: "Content Generator",
      description: "Generates marketing content and product documentation from brand guidelines",
      status: "idle",
      knowledgeSize: 42,
      lastRun: "3 days ago",
      latency: "312ms",
      accuracy: 88.3,
      tokensUsed: 3210,
      model: "Claude 3 Opus",
      owner: "Casey Wong",
      createdAt: "2 weeks ago",
      updatedAt: "3 days ago",
    },
    {
      id: 5,
      name: "Code Reviewer Bot",
      description: "Reviews pull requests and suggests improvements based on engineering standards",
      status: "running",
      knowledgeSize: 98,
      lastRun: "1 hour ago",
      latency: "178ms",
      accuracy: 94.2,
      tokensUsed: 18750,
      model: "Claude 3.5 Sonnet",
      owner: "Alex Rivers",
      createdAt: "6 weeks ago",
      updatedAt: "1 hour ago",
    },
    {
      id: 6,
      name: "Product Strategist",
      description: "Analyzes market data and roadmap to provide strategic recommendations",
      status: "stopped",
      knowledgeSize: 67,
      lastRun: "2 weeks ago",
      latency: null,
      accuracy: 0,
      tokensUsed: 0,
      model: "Claude 3 Opus",
      owner: "Casey Wong",
      createdAt: "1 month ago",
      updatedAt: "2 weeks ago",
    },
    {
      id: 7,
      name: "HR Assistant Bot",
      description: "Helps employees with HR policies, benefits, and onboarding questions",
      status: "running",
      knowledgeSize: 73,
      lastRun: "30 minutes ago",
      latency: "203ms",
      accuracy: 91.5,
      tokensUsed: 9820,
      model: "Claude 3.5 Sonnet",
      owner: "Sarah Chen",
      createdAt: "3 weeks ago",
      updatedAt: "30 minutes ago",
    },
    {
      id: 8,
      name: "API Documentation Agent",
      description: "Generates and maintains API documentation from code comments and schemas",
      status: "idle",
      knowledgeSize: 54,
      lastRun: "1 week ago",
      latency: "145ms",
      accuracy: 93.7,
      tokensUsed: 4560,
      model: "Claude 3.5 Sonnet",
      owner: "Alex Rivers",
      createdAt: "4 weeks ago",
      updatedAt: "1 week ago",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-50 text-green-700 border-green-100";
      case "idle":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "stopped":
        return "bg-gray-50 text-gray-700 border-gray-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return "text-green-700";
    if (accuracy >= 90) return "text-blue-700";
    if (accuracy >= 85) return "text-yellow-700";
    return "text-orange-700";
  };

  const tabs = [
    { id: "all", label: "All Agents" },
    { id: "running", label: "Running" },
    { id: "idle", label: "Idle" },
    { id: "stopped", label: "Stopped" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Search Bar */}
      <div className="space-y-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#7c839b]">
            search
          </span>
          <input
            type="text"
            placeholder="Search agents by name, model, owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-16 py-3 border border-[#e2e8f0] rounded-lg bg-white text-[#45464d] placeholder-[#7c839b] focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
            <kbd className="px-2 py-1 bg-[#f7f9fb] border border-[#e2e8f0] rounded text-xs text-[#7c839b]">
              Cmd
            </kbd>
            <kbd className="px-2 py-1 bg-[#f7f9fb] border border-[#e2e8f0] rounded text-xs text-[#7c839b]">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex items-center justify-between border-b border-[#e2e8f0]">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 border-b-2 rounded-t body-md transition-colors ${
                activeTab === tab.id
                  ? "border-black text-black font-medium"
                  : "border-transparent text-[#45464d] hover:border-[#e2e8f0] hover:bg-[#f7f9fb]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-[#45464d] hover:bg-[#f7f9fb] rounded">
            <span className="material-symbols-outlined text-lg">sort</span>
            <span className="body-sm">Sort: Recent</span>
          </button>
        </div>
      </div>

      {/* Agents List */}
      <div className="space-y-4">
        <p className="section-heading">AI AGENTS</p>

        <div className="space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="panel p-4 flex items-start gap-4 hover:bg-[#f7f9fb] transition-colors cursor-pointer"
            >
              {/* Agent Icon */}
              <div className="w-10 h-10 rounded-lg bg-[#e1e0ff] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-lg text-[#4648d4]">
                  smart_toy
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="body-md font-semibold text-black">
                    {agent.name}
                  </h3>
                  <span
                    className={`label-sm px-2 py-1 rounded border ${getStatusColor(
                      agent.status
                    )}`}
                  >
                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </span>
                  <span className="label-sm bg-[#dae2fd] text-[#000000] px-2 py-1 rounded">
                    {agent.model}
                  </span>
                </div>
                <p className="body-sm text-[#7c839b] mb-2 truncate">
                  {agent.description}
                </p>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="text-[#7c839b]">
                    Knowledge: <span className="font-semibold">{agent.knowledgeSize}</span> KUs
                  </span>
                  <span className="text-[#7c839b]">
                    Last run: <span className="font-semibold">{agent.lastRun}</span>
                  </span>
                  {agent.accuracy > 0 && (
                    <span className={`font-semibold ${getAccuracyColor(agent.accuracy)}`}>
                      Accuracy: {agent.accuracy}%
                    </span>
                  )}
                  {agent.latency && (
                    <span className="text-[#7c839b]">
                      Latency: <span className="font-semibold">{agent.latency}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Right side - Metadata */}
              <div className="text-right flex-shrink-0 min-w-fit">
                <p className="label-sm text-[#7c839b] font-semibold">
                  {agent.owner}
                </p>
                <p className="body-sm text-[#7c839b]">
                  {agent.tokensUsed.toLocaleString()} tokens
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
