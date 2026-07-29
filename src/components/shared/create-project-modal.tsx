"use client";

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
  { name: "Purple", value: "#e1e0ff", text: "#4648d4" },
  { name: "Blue", value: "#dae2fd", text: "#000000" },
  { name: "Gold", value: "#fff8e1", text: "#f59e0b" },
  { name: "Gray", value: "#e0e3e5", text: "#45464d" },
  { name: "Teal", value: "#e0f2fe", text: "#0369a1" },
  { name: "Pink", value: "#fce7f3", text: "#ec4899" },
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
    color: "#e1e0ff",
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
      color: "#e1e0ff",
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
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg shadow-lg z-50">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <h2 className="headline-lg text-black">Create Project</h2>
          <button
            onClick={onClose}
            className="text-[#7c839b] hover:text-black transition-colors"
          >
            <span className="material-symbols-outlined">❌</span>
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
                      ? "bg-[#4648d4] text-white"
                      : ["basic", "setup"].includes(s.step) && ["setup", "review"].includes(step)
                      ? "bg-green-500 text-white"
                      : "bg-[#e2e8f0] text-[#7c839b]"
                  }`}
                >
                  {step === s.step ? idx + 1 : ["basic", "setup"].includes(s.step) && ["setup", "review"].includes(step) ? "✓" : idx + 1}
                </div>
                <span className={`ml-2 body-sm ${step === s.step ? "font-semibold text-black" : "text-[#7c839b]"}`}>
                  {s.label}
                </span>
                {idx < 2 && (
                  <div className={`flex-1 h-1 mx-4 ${["basic", "setup"].includes(s.step) && ["setup", "review"].includes(step) ? "bg-green-500" : "bg-[#e2e8f0]"}`} />
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
                <label className="label-sm font-semibold text-black mb-2 block">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Q4 Product Launch"
                  className={`w-full px-3 py-2 border rounded-lg bg-white text-[#45464d] placeholder-[#7c839b] focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-[#e2e8f0]"
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
                  placeholder="What is this project about?"
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg bg-white text-[#45464d] placeholder-[#7c839b] focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent ${
                    errors.description ? "border-red-500" : "border-[#e2e8f0]"
                  }`}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded p-3">
                <p className="label-sm text-blue-700">
                  💡 You can add Knowledge Units to this project after creation.
                </p>
              </div>
            </div>
          )}

          {step === "setup" && (
            <div className="space-y-6">
              {/* Icon Selection */}
              <div>
                <label className="label-sm font-semibold text-black mb-3 block">
                  Folder Icon
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.icon === icon
                          ? "border-[#4648d4] bg-[#e1e0ff]"
                          : "border-[#e2e8f0] hover:border-[#cbd5e1]"
                      }`}
                    >
                      <span className="text-2xl">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="label-sm font-semibold text-black mb-3 block">
                  Folder Color
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {COLORS.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      onClick={() => setFormData((prev) => ({ ...prev, color: colorOption.value }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.color === colorOption.value
                          ? "border-[#4648d4]"
                          : "border-[#e2e8f0] hover:border-[#cbd5e1]"
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

              <div className="bg-blue-50 border border-blue-100 rounded p-3">
                <p className="label-sm text-blue-700">
                  👁️ Preview your project folder above with the selected icon and color.
                </p>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4">
              <div>
                <p className="label-sm text-[#7c839b] mb-2">Project Preview</p>
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
                      <h3 className="headline-md font-semibold text-black mb-1">
                        {formData.name || "Project Name"}
                      </h3>
                      <p className="body-sm text-[#45464d]">
                        {formData.description || "Project description..."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel p-4 space-y-3">
                <div>
                  <p className="label-sm text-[#7c839b] mb-1">Project Name</p>
                  <p className="body-md font-semibold text-black">{formData.name}</p>
                </div>
                <div>
                  <p className="label-sm text-[#7c839b] mb-1">Description</p>
                  <p className="body-md text-black">{formData.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="label-sm text-[#7c839b] mb-1">Icon</p>
                    <p className="body-md text-black capitalize">{formData.icon.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="label-sm text-[#7c839b] mb-1">Color</p>
                    <p className="body-md text-black">{getColorLabel(formData.color)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-100 rounded p-3">
                <p className="label-sm text-green-700">
                  ✓ Ready to create! You can start adding Knowledge Units right after.
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
                <span className="text-lg">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors body-md font-medium flex items-center gap-2"
              >
                <span className="text-lg">check</span>
                Create Project
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
