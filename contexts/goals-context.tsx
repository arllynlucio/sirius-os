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

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

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

  async function updateGoal(id: string, data: UpdateGoalInput) {
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

    if (error) console.error(error);

    await fetchGoals();
  }

  async function deleteGoal(id: string) {
    await supabase.from("goals").delete().eq("id", id);
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

  async function updateManualProgress(id: string, delta: number) {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;

    const nextValue = Math.max(goal.current_value + delta, 0);

    await supabase.from("goal_progress_events").insert({
      goal_id: id,
      source_type: "manual",
      delta,
      event_type: delta >= 0 ? "increment" : "decrement",
    });

    await supabase
      .from("goals")
      .update({
        current_value: nextValue,
        status: nextValue >= goal.target_value ? "completed" : "active",
        completed_at:
          nextValue >= goal.target_value
            ? new Date().toISOString()
            : null,
      })
      .eq("id", id);

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

      const { data: links, error: linksError } = await supabase
        .from("goal_task_links")
        .select("*")
        .eq("task_id", taskId)
        .eq("user_id", user.id);

      if (linksError) {
        console.error("LINK ERROR:", linksError);
        return;
      }

      if (!links?.length) {
        console.log("SEM LINKS");
        return;
      }

      for (const link of links) {
        const { data: goal, error: goalError } = await supabase
          .from("goals")
          .select("*")
          .eq("id", link.goal_id)
          .single();

        if (goalError || !goal) {
          console.error("GOAL ERROR:", goalError);
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

        const nextValue = Math.max(
          Number(goal.current_value) + delta,
          0
        );

        const { error: eventError } = await supabase
          .from("goal_progress_events")
          .insert({
            goal_id: goal.id,
            source_type: "task",
            source_id: taskId,
            delta,
            event_type:
              delta >= 0 ? "increment" : "decrement",
          });

        if (eventError) {
          console.error("EVENT ERROR:", eventError);
          continue;
        }

        const { error: updateError } = await supabase
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

        if (updateError) {
          console.error("UPDATE ERROR:", updateError);
        }
      }

      await fetchGoals();
    } catch (error) {
      console.error("AUTO GOAL ERROR:", error);
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
    throw new Error("useGoals deve ser usado dentro de GoalsProvider");
  }

  return context;
}