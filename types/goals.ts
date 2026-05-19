export type GoalPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type GoalTrackingMode =
  | "manual"
  | "automatic"
  | "hybrid";

export type GoalStatus =
  | "active"
  | "paused"
  | "completed"
  | "archived";

export type GoalSourceType =
  | "task"
  | "routine"
  | "manual"
  | "task_link";

export type GoalEventType =
  | "increment"
  | "decrement"
  | "correction";

export interface Goal {
  id: string;
  user_id: string;

  title: string;
  description: string | null;
  emoji: string | null;

  target_value: number;
  current_value: number;

  unit: string;
  deadline: string | null;

  priority: GoalPriority;
  tracking_mode: GoalTrackingMode;
  status: GoalStatus;

  is_primary: boolean;

  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface GoalProgressEvent {
  id: string;
  goal_id: string;

  source_type: GoalSourceType;
  source_id: string | null;

  delta: number;
  event_type: GoalEventType;

  created_at: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;

  emoji?: string;

  target_value: number;
  unit: string;

  deadline?: string | null;

  priority: GoalPriority;
  tracking_mode: GoalTrackingMode;

  is_primary?: boolean;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string | null;
  emoji?: string | null;

  target_value?: number;
  current_value?: number;

  unit?: string;
  deadline?: string | null;

  priority?: GoalPriority;
  tracking_mode?: GoalTrackingMode;
  status?: GoalStatus;

  is_primary?: boolean;
}