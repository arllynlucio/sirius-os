"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { supabase } from "@/lib/supabase";
import {
  Goal,
  CreateGoalInput,
  UpdateGoalInput,
} from "@/types/goals";

interface GoalsContextType {
  goals: Goal[];
  loading: boolean;
  fetchGoals: () => Promise<void>;
  createGoal: (data: CreateGoalInput) => Promise<void>;
  updateGoal: (id: string, data: UpdateGoalInput) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setPrimaryGoal: (id: string) => Promise<void>;
  updateManualProgress: (id: string, delta: number) => Promise<void>;
  applyTaskLinkProgress: (
    taskId: string,
    completed: boolean
  ) => Promise<void>;
}

const GoalsContext = createContext<GoalsContextType | undefined>(
  undefined
);

async function registerProgressHistory({
  userId,
  goalId,
  before,
  after,
  delta,
  source,
}: {
  userId: string;
  goalId: string;
  before: number;
  after: number;
  delta: number;
  source: "manual" | "task_link" | "automatic";
}) {
  const { error } = await supabase
    .from("goal_progress_history")
    .insert({
      user_id: userId,
      goal_id: goalId,
      progress_before: before,
      progress_after: after,
      delta,
      source,
    });

  if (error) {
    console.error("HISTORY ERROR:", error);
  }
}

export function GoalsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchGoals() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setGoals([]);
        return;
      }

      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setGoals((data as Goal[]) || []);
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createGoal(data: CreateGoalInput) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (data.is_primary) {
      await supabase
        .from("goals")
        .update({ is_primary: false })
        .eq("user_id", user.id);
    }

    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      title: data.title,
      description: data.description ?? null,
      emoji: data.emoji ?? "🎯",
      target_value: data.target_value,
      current_value: 0,
      unit: data.unit,
      deadline: data.deadline ?? null,
      priority: data.priority,
      tracking_mode: data.tracking_mode,
      status: "active",
      is_primary: data.is_primary ?? false,
    });

    if (error) {
      console.error(error);
      throw error;
    }

    await fetchGoals();
  }

  async function updateGoal(
    id: string,
    data: UpdateGoalInput
  ) {
    const goal = goals.find((g) => g.id === id);

    if (!goal) return;

    if (data.is_primary) {
      await supabase
        .from("goals")
        .update({ is_primary: false })
        .eq("user_id", goal.user_id);
    }

    const { error } = await supabase
      .from("goals")
      .update(data)
      .eq("id", id);

    if (error) {
      console.error(error);
    }

    await fetchGoals();
  }

  async function deleteGoal(id: string) {
    await supabase
      .from("goals")
      .delete()
      .eq("id", id);

    await fetchGoals();
  }

  async function setPrimaryGoal(id: string) {
    const goal = goals.find((g) => g.id === id);

    if (!goal) return;

    await supabase
      .from("goals")
      .update({ is_primary: false })
      .eq("user_id", goal.user_id);

    await supabase
      .from("goals")
      .update({ is_primary: true })
      .eq("id", id);

    await fetchGoals();
  }

  async function updateManualProgress(
    id: string,
    delta: number
  ) {
    const goal = goals.find((g) => g.id === id);

    if (!goal) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const currentValue = Number(goal.current_value);
    const nextValue = Math.max(
      currentValue + delta,
      0
    );

    await registerProgressHistory({
      userId: user.id,
      goalId: goal.id,
      before: currentValue,
      after: nextValue,
      delta,
      source: "manual",
    });

    await supabase
      .from("goals")
      .update({
        current_value: nextValue,
        status:
          nextValue >= goal.target_value
            ? "completed"
            : "active",
        completed_at:
          nextValue >= goal.target_value
            ? new Date().toISOString()
            : null,
      })
      .eq("id", goal.id);

    await fetchGoals();
  }

  async function applyTaskLinkProgress(
    taskId: string,
    completed: boolean
  ) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: links, error: linksError } =
        await supabase
          .from("goal_task_links")
          .select("*")
          .eq("task_id", taskId)
          .eq("user_id", user.id);

      if (linksError || !links?.length) {
        return;
      }

      for (const link of links) {
        const { data: goal, error: goalError } =
          await supabase
            .from("goals")
            .select("*")
            .eq("id", link.goal_id)
            .single();

        if (goalError || !goal) {
          continue;
        }

        if (
          goal.tracking_mode !== "automatic" &&
          goal.tracking_mode !== "hybrid"
        ) {
          continue;
        }

        const delta = completed
          ? Number(link.progress_delta)
          : -Number(link.progress_delta);

        const currentValue = Number(goal.current_value);

        const nextValue = Math.max(
          currentValue + delta,
          0
        );

        await registerProgressHistory({
          userId: user.id,
          goalId: goal.id,
          before: currentValue,
          after: nextValue,
          delta,
          source: "task_link",
        });

        await supabase
          .from("goals")
          .update({
            current_value: nextValue,
            status:
              nextValue >= goal.target_value
                ? "completed"
                : "active",
            completed_at:
              nextValue >= goal.target_value
                ? new Date().toISOString()
                : null,
          })
          .eq("id", goal.id);
      }

      await fetchGoals();
    } catch (error) {
      console.error(
        "AUTO GOAL PROGRESS ERROR:",
        error
      );
    }
  }

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <GoalsContext.Provider
      value={{
        goals,
        loading,
        fetchGoals,
        createGoal,
        updateGoal,
        deleteGoal,
        setPrimaryGoal,
        updateManualProgress,
        applyTaskLinkProgress,
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalsContext);

  if (!context) {
    throw new Error(
      "useGoals deve ser usado dentro de GoalsProvider"
    );
  }

  return context;
}