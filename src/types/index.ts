export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type MemberRole = "owner" | "admin" | "editor" | "viewer";

export interface Membership {
  id: string;
  user_id: string;
  organization_id: string;
  role: MemberRole;
  created_at: string;
}

export interface Domain {
  id: string;
  organization_id: string;
  name: string;
  parent_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export type KUStatus = "draft" | "proposed" | "approved" | "archived";

export interface KnowledgeUnit {
  id: string;
  hash: string;
  version: number;
  domain_id: string;
  owner_id: string;
  organization_id: string;
  title: string;
  content: string;
  embedding: number[] | null;
  trust_score: number;
  status: KUStatus;
  dependencies: string[];
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

export interface KUVersion {
  id: string;
  ku_id: string;
  version: number;
  hash: string;
  content: string;
  changed_by: string;
  change_message: string | null;
  created_at: string;
}
