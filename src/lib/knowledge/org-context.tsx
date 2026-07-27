"use client";

import { createContext, useContext } from "react";

interface OrgContextValue {
  organizationId: string;
  organizationName: string;
  role: string;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export const OrgProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: OrgContextValue;
}) => {
  return <OrgContext value={value}>{children}</OrgContext>;
};

export const useOrg = () => {
  const ctx = useContext(OrgContext);
  if (!ctx) {
    throw new Error("useOrg must be used within OrgProvider");
  }
  return ctx;
};
