"use client";
import { Icon } from "@/components/shared/icon";

import { useState } from "react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
}

export interface ProjectFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
}

const COLORS = [
  { name: "Purple", value: "#172554", text: "#3b82f6" },
  { name: "Blue", value: "#172554", text: "#000000" },
  { name: "Gold", value: "#2a2410", text: "#f59e0b" },
  { name: "Gray", value: "#182032", text: "#94a3b8" },
  { name: "Teal", value: "#0f2030", text: "#3b82f6" },
  { name: "Pink", value: "#241320", text: "#ec4899" },
];

const ICONS = [
  "folder_open",
  "folder",
  "work",
  "assignment",
  "description",
  "layers",
  "category",
  "dashboard",
];

export const CreateProjectModal = ({ isOpen, onClose, onSubmit }: CreateProjectModalProps) => {
  const [step, setStep] = useState<"basic" | "setup" | "review">("basic");
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    icon: "folder_open",
    color: "#172554",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (!formData.name.trim()) newErrors.name = "Project name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === "basic" && validateBasic()) {
      setStep("setup");
    } else if (step === "setup") {
      setStep("review");
    }
  };

  const handlePrev = () => {
    if (step === "setup") setStep("basic");
    if (step === "review") setStep("setup");
  };

  const handleSubmit = () => {
    onSubmit(formData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "folder_open",
      color: "#172554",
    });
    setStep("basic");
    setErrors({});
  };

  const getColorLabel = (colorValue: string) => {
    return COLORS.find((c) => c.value === colorValue)?.name || "Purple";
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
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[var(--sky-2)] rounded-lg shadow-lg z-50">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <h2 className="headline-lg text-[var(--star-1)]">Create Project</h2>
          <button
            onClick={onClose}
            className="text-[#64748b] hover:text-[var(--star-1)] transition-colors"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-8">
            {[
              { step: "basic", label: "Basic Info" },
              { step: "setup", label: "Customize" },
              { step: "review", label: "Review" },
            ].map((s, idx) => (
              <div key={s.step} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step === s.step
                      ? "bg-[#3b82f6] text-[var(--azure-ink)]"
                      : ["basic", "setup"].includes(s.step) && ["setup", "review"].includes(step)
                      ? "bg-[var(--verified)] text-[var(--azure-ink)]"
                      : "bg-[#1e293b] text-[#64748b]"
                  }`}
                >
                  {step === s.step ? idx + 1 : ["basic", "setup"].includes(s.step) && ["setup", "review"].includes(step) ? <Icon name="check" size={14} strokeWidth={2.4} /> : idx + 1}
                </div>
                <span className={`ml-2 body-sm ${step === s.step ? "font-semibold text-[var(--star-1)]" : "text-[#64748b]"}`}>
                  {s.label}
                </span>
                {idx < 2 && (
                  <div className={`flex-1 h-1 mx-4 ${["basic", "setup"].includes(s.step) && ["setup", "review"].includes(step) ? "bg-[var(--verified)]" : "bg-[#1e293b]"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto">
          {step === "basic" && (
            <div className="space-y-4">
              {/* Project Name */}
              <div>
                <label className="label-sm font-semibold text-[var(--star-1)] mb-2 block">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Q4 Product Launch"
                  className={`w-full px-3 py-2 border rounded-lg bg-[var(--sky-2)] text-[#94a3b8] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent ${
                    errors.name ? "border-[rgb(239_68_68_/_0.5)]" : "border-[#1e293b]"
                  }`}
                />
                {errors.name && <p className="text-[var(--danger)] text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="label-sm font-semibold text-[var(--star-1)] mb-2 block">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="What is this project about?"
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg bg-[var(--sky-2)] text-[#94a3b8] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent ${
                    errors.description ? "border-[rgb(239_68_68_/_0.5)]" : "border-[#1e293b]"
                  }`}
                />
                {errors.description && <p className="text-[var(--danger)] text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="bg-[rgb(59_130_246_/_0.12)] border border-[rgb(59_130_246_/_0.28)] rounded p-3">
                <p className="label-sm text-[var(--azure)]">
                  You can add Knowledge Units to this project after creation.
                </p>
              </div>
            </div>
          )}

          {step === "setup" && (
            <div className="space-y-6">
              {/* Icon Selection */}
              <div>
                <label className="label-sm font-semibold text-[var(--star-1)] mb-3 block">
                  Folder Icon
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.icon === icon
                          ? "border-[#3b82f6] bg-[#172554]"
                          : "border-[#1e293b] hover:border-[#334155]"
                      }`}
                    >
                      <span className="text-2xl">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="label-sm font-semibold text-[var(--star-1)] mb-3 block">
                  Folder Color
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {COLORS.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      onClick={() => setFormData((prev) => ({ ...prev, color: colorOption.value }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.color === colorOption.value
                          ? "border-[#3b82f6]"
                          : "border-[#1e293b] hover:border-[#334155]"
                      }`}
                      style={{ backgroundColor: colorOption.value }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-lg"
                          style={{ color: colorOption.text }}
                        >
                          {formData.icon}
                        </span>
                        <span className="label-sm font-semibold" style={{ color: colorOption.text }}>
                          {colorOption.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[rgb(59_130_246_/_0.12)] border border-[rgb(59_130_246_/_0.28)] rounded p-3">
                <p className="label-sm text-[var(--azure)]">
                  Preview your project folder above with the selected icon and color.
                </p>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4">
              <div>
                <p className="label-sm text-[#64748b] mb-2">Project Preview</p>
                <div
                  className="p-6 rounded-lg border-2"
                  style={{ backgroundColor: formData.color }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div
                        className="w-16 h-16 rounded-lg flex items-center justify-center mb-4"
                        style={{ backgroundColor: formData.color, opacity: 0.8 }}
                      >
                        <span
                          className="text-3xl"
                          style={{ color: COLORS.find((c) => c.value === formData.color)?.text }}
                        >
                          {formData.icon}
                        </span>
                      </div>
                      <h3 className="headline-md font-semibold text-[var(--star-1)] mb-1">
                        {formData.name || "Project Name"}
                      </h3>
                      <p className="body-sm text-[#94a3b8]">
                        {formData.description || "Project description..."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel p-4 space-y-3">
                <div>
                  <p className="label-sm text-[#64748b] mb-1">Project Name</p>
                  <p className="body-md font-semibold text-[var(--star-1)]">{formData.name}</p>
                </div>
                <div>
                  <p className="label-sm text-[#64748b] mb-1">Description</p>
                  <p className="body-md text-[var(--star-1)]">{formData.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="label-sm text-[#64748b] mb-1">Icon</p>
                    <p className="body-md text-[var(--star-1)] capitalize">{formData.icon.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="label-sm text-[#64748b] mb-1">Color</p>
                    <p className="body-md text-[var(--star-1)]">{getColorLabel(formData.color)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[rgb(16_185_129_/_0.12)] border border-[rgb(16_185_129_/_0.28)] rounded p-3">
                <p className="label-sm text-[var(--verified)]">
                  Ready to create! You can start adding Knowledge Units right after.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1e293b]">
          <div className="flex gap-2">
            {step !== "basic" && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 border border-[#1e293b] rounded-lg text-[#94a3b8] hover:bg-[#07090e] transition-colors body-md"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#1e293b] rounded-lg text-[#94a3b8] hover:bg-[#07090e] transition-colors body-md"
            >
              Cancel
            </button>
            {step !== "review" ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[#3b82f6] text-[var(--azure-ink)] rounded-lg hover:bg-[#2563eb] transition-colors body-md font-medium flex items-center gap-2"
              >
                Next
                <Icon name="chevron-right" size={16} strokeWidth={2.2} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[var(--verified)] text-[var(--azure-ink)] rounded-lg hover:bg-[var(--verified)] transition-colors body-md font-medium flex items-center gap-2"
              >
                <Icon name="review" size={16} />
                Create Project
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
