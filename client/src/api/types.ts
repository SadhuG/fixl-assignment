export type Role = 'ADMIN' | 'MEMBER';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  role: Role;
}

export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface UserRef {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  organization: string;
  createdBy: UserRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithCounts extends Project {
  taskCounts: Record<Status, number>;
}

export interface ListResponse<T> {
  data: T[];
}
