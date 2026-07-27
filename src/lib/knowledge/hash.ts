import { createHash } from "crypto";

export const generateKUHash = (title: string, content: string): string => {
  return createHash("sha256")
    .update(`${title}\n${content}`)
    .digest("hex")
    .slice(0, 12);
};
