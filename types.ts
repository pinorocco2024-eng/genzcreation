
export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  type: 'trigger' | 'action' | 'condition';
}

export interface WorkflowPlan {
  name: string;
  steps: WorkflowStep[];
  outcome: string;
}
