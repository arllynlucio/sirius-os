export interface GoalTaskLink {
  id: string

  user_id: string

  goal_id: string
  task_id: string

  progress_delta: number

  created_at: string
}

export interface CreateGoalTaskLinkInput {
  goal_id: string
  task_id: string
  progress_delta: number
}