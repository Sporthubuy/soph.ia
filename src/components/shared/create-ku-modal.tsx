"use client";

import { useState } from "react";

interface CreateKUModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: KUFormData) => void;
}

export interface KUFormData {
  title: string;
  description: string;
  content: string;
  domain: string;
  dependencies: string[];
}

const DOMAINS = [
  "Research",
  "Operations",
  "Legal",
  "Product",
  "Engineering",
  "Marketing",
  "HR",
  "Finance",
];

export const CreateKUModal = ({ isOpen, onClose, onSubmit }: CreateKUModalProps) => {
  const [step, setStep] = useState<"basic" | "content" | "review">("basic");
  const [formData, setFormData] = useState<KUFormData>({
    title: "",
    description: "",
    content: "",
    domain: "Research",
    dependencies: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateBasic = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.domain) newErrors.domain = "Domain is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateContent = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.content.trim()) newErrors.content = "Content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === "basic" && validateBasic()) {
      setStep("content");
    } else if (step === "content" && validateContent()) {
      setStep("review");
    }
  };

  const handlePrev = () => {
    if (step === "content") setStep("basic");
    if (step === "review") setStep("content");
  };

  const handleSubmit = () => {
    onSubmit(formData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      domain: "Research",
      dependencies: [],
    });
    setStep("basic");
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg shadow-lg z-50">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <h2 className="headline-lg text-black">Create Knowledge Unit</h2>
          <button
            onClick={onClose}
            className="text-[#7c839b] hover:text-black transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-8">
            {[
              { step: "basic", label: "Basic Info" },
              { step: "content", label: "Content" },
              { step: "review", label: "Review" },
            ].map((s, idx) => (
              <div key={s.step} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step === s.step
                      ? "bg-[#4648d4] text-white"
                      : ["basic", "content"].includes(s.step) && ["content", "review"].includes(step)
                      ? "bg-green-500 text-white"
                      : "bg-[#e2e8f0] text-[#7c839b]"
                  }`}
                >
                  {step === s.step ? idx + 1 : ["basic", "content"].includes(s.step) && ["content", "review"].includes(step) ? "✓" : idx + 1}
                </div>
                <span className={`ml-2 body-sm ${step === s.step ? "font-semibold text-black" : "text-[#7c839b]"}`}>
                  {s.label}
                </span>
                {idx < 2 && (
                  <div className={`flex-1 h-1 mx-4 ${["basic", "content"].includes(s.step) && ["content", "review"].includes(step) ? "bg-green-500" : "bg-[#e2e8f0]"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto">
          {step === "basic" && (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="label-sm font-semibold text-black mb-2 block">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., API Authentication Standards"
                  className={`w-full px-3 py-2 border rounded-lg bg-white text-[#45464d] placeholder-[#7c839b] focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent ${
                    errors.title ? "border-red-500" : "border-[#e2e8f0]"
                  }`}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="label-sm font-semibold text-black mb-2 block">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief summary of this Knowledge Unit..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg bg-white text-[#45464d] placeholder-[#7c839b] focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent ${
                    errors.description ? "border-red-500" : "border-[#e2e8f0]"
                  }`}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Domain */}
              <div>
                <label className="label-sm font-semibold text-black mb-2 block">
                  Domain *
                </label>
                <select
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg bg-white text-[#45464d] focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent ${
                    errors.domain ? "border-red-500" : "border-[#e2e8f0]"
                  }`}
                >
                  {DOMAINS.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
                {errors.domain && <p className="text-red-500 text-sm mt-1">{errors.domain}</p>}
              </div>
            </div>
          )}

          {step === "content" && (
            <div className="space-y-4">
              <div>
                <label className="label-sm font-semibold text-black mb-2 block">
                  Content (Markdown) *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Enter the knowledge content in Markdown format..."
                  rows={12}
                  className={`w-full px-3 py-2 border rounded-lg bg-white text-[#45464d] placeholder-[#7c839b] focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent font-mono text-sm ${
                    errors.content ? "border-red-500" : "border-[#e2e8f0]"
                  }`}
                />
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
                <p className="text-[#7c839b] text-xs mt-2">
                  💡 Tip: Use Markdown for formatting. Headers, lists, code blocks, links are all supported.
                </p>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4">
              <div className="panel p-4 space-y-3">
                <div>
                  <p className="label-sm text-[#7c839b] mb-1">Title</p>
                  <p className="body-md font-semibold text-black">{formData.title}</p>
                </div>
                <div>
                  <p className="label-sm text-[#7c839b] mb-1">Description</p>
                  <p className="body-md text-black">{formData.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="label-sm text-[#7c839b] mb-1">Domain</p>
                    <p className="body-md font-semibold text-black">{formData.domain}</p>
                  </div>
                  <div>
                    <p className="label-sm text-[#7c839b] mb-1">Status</p>
                    <span className="label-sm px-2 py-1 rounded border bg-yellow-50 text-yellow-700 border-yellow-100">
                      Draft
                    </span>
                  </div>
                </div>
                <div>
                  <p className="label-sm text-[#7c839b] mb-1">Content Preview</p>
                  <div className="bg-[#f7f9fb] p-3 rounded text-sm text-[#45464d] max-h-40 overflow-y-auto">
                    {formData.content.slice(0, 200)}
                    {formData.content.length > 200 && "..."}
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded p-3">
                <p className="label-sm text-blue-700">
                  ℹ️ This Knowledge Unit will be created in <strong>Draft</strong> status. You can propose it for review after creation.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#e2e8f0]">
          <div className="flex gap-2">
            {step !== "basic" && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 border border-[#e2e8f0] rounded-lg text-[#45464d] hover:bg-[#f7f9fb] transition-colors body-md"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#e2e8f0] rounded-lg text-[#45464d] hover:bg-[#f7f9fb] transition-colors body-md"
            >
              Cancel
            </button>
            {step !== "review" ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[#4648d4] text-white rounded-lg hover:bg-[#3a3ab0] transition-colors body-md font-medium flex items-center gap-2"
              >
                Next
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors body-md font-medium flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">check</span>
                Create
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
