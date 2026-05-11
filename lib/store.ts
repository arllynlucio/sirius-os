import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type EnergyLevel = 'low' | 'medium' | 'high'
export type ProductivityRating = 'weak' | 'normal' | 'productive'
export type TaskType = 'routine' | 'single'

export interface Task {
  id: string
  emoji: string
  title: string
  type: TaskType
  completed: boolean
  createdAt: string
}

export interface DailyRecord {
  id: string
  date: string
  energy: EnergyLevel | null
  productivity: ProductivityRating | null
  tasks: Task[]
  completedTasksCount: number
}

export interface Goal {
  id: string
  emoji: string
  title: string
  progress: number
  type: 'monthly' | 'yearly'
  createdAt: string
}

export interface UserProfile {
  name: string
  email: string
  avatar?: string
}

interface AppState {
  // User
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void
  
  // Streak
  currentStreak: number
  
  // Today's data
  todayRecord: DailyRecord | null
  setTodayEnergy: (energy: EnergyLevel) => void
  setTodayProductivity: (productivity: ProductivityRating) => void
  
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void
  toggleTask: (taskId: string) => void
  deleteTask: (taskId: string) => void
  
  // History
  history: DailyRecord[]
  
  // Goals
  goals: Goal[]
  addGoal: (goal: Omit<Goal, 'id' | 'progress' | 'createdAt'>) => void
  updateGoalProgress: (goalId: string, progress: number) => void
  deleteGoal: (goalId: string) => void
  
  // Settings
  settings: {
    theme: 'dark' | 'light'
    notifications: boolean
  }
  updateSettings: (settings: Partial<AppState['settings']>) => void
  
  // Initialization
  initializeDay: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 15)

const getTodayString = () => new Date().toISOString().split('T')[0]

// Default routine tasks
const defaultRoutineTasks: Omit<Task, 'id' | 'completed' | 'createdAt'>[] = [
  { emoji: '🏃', title: 'Exercício matinal', type: 'routine' },
  { emoji: '📚', title: 'Ler 30 minutos', type: 'routine' },
  { emoji: '🧘', title: 'Meditação', type: 'routine' },
  { emoji: '💧', title: 'Beber 2L de água', type: 'routine' },
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: { name: 'Usuário', email: 'usuario@email.com' },
      currentStreak: 12,
      todayRecord: null,
      history: [
        {
          id: '1',
          date: '2024-05-14',
          energy: 'high',
          productivity: 'productive',
          tasks: [],
          completedTasksCount: 5,
        },
        {
          id: '2',
          date: '2024-05-13',
          energy: 'medium',
          productivity: 'normal',
          tasks: [],
          completedTasksCount: 3,
        },
        {
          id: '3',
          date: '2024-05-12',
          energy: 'high',
          productivity: 'productive',
          tasks: [],
          completedTasksCount: 6,
        },
        {
          id: '4',
          date: '2024-05-11',
          energy: 'low',
          productivity: 'weak',
          tasks: [],
          completedTasksCount: 2,
        },
        {
          id: '5',
          date: '2024-05-10',
          energy: 'medium',
          productivity: 'normal',
          tasks: [],
          completedTasksCount: 4,
        },
      ],
      goals: [
        { id: '1', emoji: '📖', title: 'Ler 12 livros', progress: 42, type: 'yearly', createdAt: '2024-01-01' },
        { id: '2', emoji: '🏋️', title: 'Treinar 20 dias', progress: 75, type: 'monthly', createdAt: '2024-05-01' },
        { id: '3', emoji: '💰', title: 'Economizar R$5000', progress: 60, type: 'yearly', createdAt: '2024-01-01' },
        { id: '4', emoji: '🎯', title: 'Completar projeto X', progress: 30, type: 'monthly', createdAt: '2024-05-01' },
      ],
      settings: {
        theme: 'dark',
        notifications: true,
      },

      setUser: (user) => set({ user }),

      setTodayEnergy: (energy) =>
        set((state) => ({
          todayRecord: state.todayRecord
            ? { ...state.todayRecord, energy }
            : null,
        })),

      setTodayProductivity: (productivity) =>
        set((state) => {
          if (!state.todayRecord) return state
          
          const updatedRecord = { ...state.todayRecord, productivity }
          
          // Add to history when productivity is set (end of day)
          return {
            todayRecord: updatedRecord,
            history: [updatedRecord, ...state.history.filter(r => r.date !== updatedRecord.date)],
            currentStreak: productivity !== 'weak' ? state.currentStreak + 1 : 0,
          }
        }),

      addTask: (task) =>
        set((state) => {
          if (!state.todayRecord) return state
          
          const newTask: Task = {
            ...task,
            id: generateId(),
            completed: false,
            createdAt: new Date().toISOString(),
          }
          
          return {
            todayRecord: {
              ...state.todayRecord,
              tasks: [...state.todayRecord.tasks, newTask],
            },
          }
        }),

      toggleTask: (taskId) =>
        set((state) => {
          if (!state.todayRecord) return state
          
          const tasks = state.todayRecord.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
          
          return {
            todayRecord: {
              ...state.todayRecord,
              tasks,
              completedTasksCount: tasks.filter((t) => t.completed).length,
            },
          }
        }),

      deleteTask: (taskId) =>
        set((state) => {
          if (!state.todayRecord) return state
          
          const tasks = state.todayRecord.tasks.filter((task) => task.id !== taskId)
          
          return {
            todayRecord: {
              ...state.todayRecord,
              tasks,
              completedTasksCount: tasks.filter((t) => t.completed).length,
            },
          }
        }),

      addGoal: (goal) =>
        set((state) => ({
          goals: [
            ...state.goals,
            {
              ...goal,
              id: generateId(),
              progress: 0,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateGoalProgress: (goalId, progress) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId ? { ...goal, progress: Math.min(100, Math.max(0, progress)) } : goal
          ),
        })),

      deleteGoal: (goalId) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== goalId),
        })),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      initializeDay: () => {
        const today = getTodayString()
        const state = get()
        
        // Check if we already have today's record
        if (state.todayRecord?.date === today) return
        
        // Create new day record with routine tasks
        const routineTasks: Task[] = defaultRoutineTasks.map((task) => ({
          ...task,
          id: generateId(),
          completed: false,
          createdAt: new Date().toISOString(),
        }))
        
        set({
          todayRecord: {
            id: generateId(),
            date: today,
            energy: null,
            productivity: null,
            tasks: routineTasks,
            completedTasksCount: 0,
          },
        })
      },
    }),
    {
      name: 'sirius-os-storage',
    }
  )
)
