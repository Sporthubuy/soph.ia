"use client";

import { useState } from "react";
import { CreateKUModal, type KUFormData } from "./create-ku-modal";
import { createKnowledgeUnit } from "@/lib/knowledge/actions";

interface KnowledgeOverviewProps {
  knowledgeUnits: any[];
  locale: string;
}

export const KnowledgeOverview = ({ knowledgeUnits: initialKUs, locale }: KnowledgeOverviewProps) => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [knowledgeUnits, setKnowledgeUnits] = useState(initialKUs);
  const [isCreating, setIsCreating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-50 text-green-700 border-green-100";
      case "proposed":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "draft":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "archived":
        return "bg-gray-50 text-gray-700 border-gray-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      Research: "#e1e0ff",
      Operations: "#dae2fd",
      Legal: "#fff8e1",
      Product: "#e0f2fe",
      Engineering: "#dbeafe",
      Marketing: "#fce7f3",
    };
    return colors[domain] || "#e0e3e5";
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700";
    if (score >= 70) return "text-blue-700";
    if (score >= 50) return "text-yellow-700";
    return "text-orange-700";
  };

  const tabs = [
    { id: "all", label: "All Units" },
    { id: "approved", label: "Approved" },
    { id: "proposed", label: "Proposed" },
    { id: "draft", label: "Draft" },
  ];

  const handleCreateKU = async (formData: KUFormData) => {
    setIsCreating(true);
    try {
      const result = await createKnowledgeUnit(
        {
          title: formData.title,
          description: formData.description,
          content: formData.content,
          domain: formData.domain,
          dependencies: formData.dependencies,
        },
        locale
      );
      if (result.success) {
        setKnowledgeUnits([result.data, ...knowledgeUnits]);
        setIsCreateModalOpen(false);
        console.log("Knowledge Unit created successfully!");
      }
    } catch (error) {
      console.error("Error creating Knowledge Unit:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with Search and Create Button */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="headline-lg text-black">Knowledge Units</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-[#4648d4] text-white rounded-lg hover:bg-[#3a3ab0] transition-colors font-medium body-md"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          New Knowledge Unit
        </button>
      </div>

      {/* Search Bar */}
      <div className="space-y-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#7c839b]">
            search
          </span>
          <input
            type="text"
            placeholder="Search Knowledge Units by title, domain, owner..."
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

      {/* Knowledge Units List */}
      <div className="space-y-4">
        <p className="section-heading">KNOWLEDGE UNITS</p>

        {knowledgeUnits.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="body-md text-[#7c839b]">No Knowledge Units yet. Create one to get started!</p>
          </div>
        ) : (
        <div className="space-y-2">
          {knowledgeUnits.map((ku) => (
            <div
              key={ku.id}
              className="panel p-4 flex items-start gap-4 hover:bg-[#f7f9fb] transition-colors cursor-pointer"
            >
              {/* Domain Icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: getDomainColor(ku.domain) }}
              >
                <span className="material-symbols-outlined text-lg">menu_book</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="body-md font-semibold text-black">
                    {ku.title}
                  </h3>
                  <span
                    className={`label-sm px-2 py-1 rounded border ${getStatusColor(
                      ku.status
                    )}`}
                  >
                    {ku.status.charAt(0).toUpperCase() + ku.status.slice(1)}
                  </span>
                  <span className={`label-sm font-semibold ${getTrustScoreColor(ku.trustScore)}`}>
                    Trust: {ku.trustScore}%
                  </span>
                </div>
                <p className="body-sm text-[#7c839b] mb-2 truncate">
                  {ku.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-[#7c839b]">
                    Domain: <span className="font-semibold">{ku.domain}</span>
                  </span>
                  <span className="text-[#7c839b]">
                    <span className="font-semibold">{ku.dependencies}</span> Dependencies
                  </span>
                  <span className="text-[#7c839b]">
                    v<span className="font-semibold">{ku.version}</span>
                  </span>
                </div>
              </div>

              {/* Right side - Metadata */}
              <div className="text-right flex-shrink-0 min-w-fit">
                <p className="label-sm text-[#7c839b] font-semibold">
                  {ku.owner}
                </p>
                <p className="body-sm text-[#7c839b]">
                  {ku.updatedAt}
                </p>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Create KU Modal */}
      <CreateKUModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateKU}
      />
    </div>
  );
};
