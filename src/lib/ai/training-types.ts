import type {
  TrainingPlanDay,
  TrainingPlanRequest,
} from "@/features/training-plan/types";

export type TrainingPlanAiContext = {
  request: TrainingPlanRequest;
  title: string;
  summary: string;
  weeklySchedule: string[];
  days: Array<Pick<TrainingPlanDay, "label" | "focus" | "summary">>;
};

export interface AiTrainingPlanProvider {
  generateExplanation(
    context: TrainingPlanAiContext,
  ): Promise<{ explanation: string[] }>;
}

