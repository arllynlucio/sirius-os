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
  GoalTaskLink,
  CreateGoalTaskLinkInput,
} from "@/types/goal-links";

interface GoalLinksContextType {
  links: GoalTaskLink[];
  loading: boolean;

  fetchLinks: () => Promise<void>;
  createLink: (data: CreateGoalTaskLinkInput) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  getTaskLinks: (taskId: string) => GoalTaskLink[];
}

const GoalLinksContext = createContext<
  GoalLinksContextType | undefined
>(undefined);

export function GoalLinksProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [links, setLinks] = useState<GoalTaskLink[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLinks() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLinks([]);
        return;
      }

      const { data, error } = await supabase
        .from("goal_task_links")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      setLinks((data as GoalTaskLink[]) || []);
    } catch (error) {
      console.error("Erro ao buscar vínculos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createLink(
    data: CreateGoalTaskLinkInput
  ) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from("goal_task_links")
        .insert({
          user_id: user.id,
          goal_id: data.goal_id,
          task_id: data.task_id,
          progress_delta: data.progress_delta,
        });

      if (error) throw error;

      await fetchLinks();
    } catch (error) {
      console.error("Erro ao criar vínculo:", error);
      throw error;
    }
  }

  async function deleteLink(id: string) {
    try {
      const { error } = await supabase
        .from("goal_task_links")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchLinks();
    } catch (error) {
      console.error("Erro ao remover vínculo:", error);
    }
  }

  function getTaskLinks(taskId: string) {
    return links.filter((link) => link.task_id === taskId);
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  return (
    <GoalLinksContext.Provider
      value={{
        links,
        loading,
        fetchLinks,
        createLink,
        deleteLink,
        getTaskLinks,
      }}
    >
      {children}
    </GoalLinksContext.Provider>
  );
}

export function useGoalLinks() {
  const context = useContext(GoalLinksContext);

  if (!context) {
    throw new Error(
      "useGoalLinks deve ser usado dentro de GoalLinksProvider"
    );
  }

  return context;
}