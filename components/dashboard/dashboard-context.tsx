"use client"

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react"

type DashboardContextType = {
  currentStreak: number
  setCurrentStreak: React.Dispatch<React.SetStateAction<number>>

  refreshTrigger: number
  triggerRefresh: () => void
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function DashboardProvider({
  children,
}: {
  children: ReactNode
}) {
  const [currentStreak, setCurrentStreak] = useState(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <DashboardContext.Provider
      value={{
        currentStreak,
        setCurrentStreak,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)

  if (!context) {
    throw new Error(
      "useDashboard must be used inside DashboardProvider"
    )
  }

  return context
}