import { ReactNode } from "react";
import "@/app/globals.css";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
