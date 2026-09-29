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

export interface Assignee extends UserRef {
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  project: string;
  organization: string;
  assignee: Assignee | null;
  createdBy: UserRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  joinedAt: string;
}

export interface AssignedTask extends Omit<Task, 'project'> {
  project: { id: string; name: string };
}

export interface OrgStats {
  byStatus: Record<Status, number>;
  assignedToMe: AssignedTask[];
  recentProjects: Project[];
}

export interface ListResponse<T> {
  data: T[];
}
