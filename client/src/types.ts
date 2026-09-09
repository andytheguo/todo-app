export type Task = {
  id: number,
  title: string,
  description?: string,
  complete: boolean,
  projectId: number,
  order: number
};

export type Project = {
  id: number,
  name: string,
  description?: string
  total: number,
  completed: number
};
