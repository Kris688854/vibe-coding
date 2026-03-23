import type {
  AiTrainingPlanProvider,
  TrainingPlanAiContext,
} from "@/lib/ai/training-types";

export class MockTrainingPlanProvider implements AiTrainingPlanProvider {
  async generateExplanation(context: TrainingPlanAiContext) {
    const { request, weeklySchedule, days } = context;
    const goalLabel =
      request.goal === "bulk"
        ? "增肌"
        : request.goal === "cut"
          ? "减脂"
          : request.goal === "recomp"
            ? "体态重组"
            : "维持";

    return {
      explanation: [
        `这套计划以每周 ${request.trainingDaysPerWeek} 练为前提，采用 ${request.splitType} 结构，是为了在你当前 ${request.sessionDurationMinutes} 分钟单次时长内，把主要肌群的有效训练量均匀铺开。`,
        `动作选择优先匹配 ${request.equipmentAccess} 条件，并结合 ${request.experienceLevel} 训练水平控制复杂度，确保你既能稳定推进，也不容易因为动作门槛过高而中断。`,
        `围绕 ${goalLabel} 目标，计划里把高价值复合动作放在每天前半段，再用孤立动作补足薄弱部位，这样更容易兼顾强度、训练量和恢复。`,
        `周安排依照 ${weeklySchedule.join("、")} 展开，连续训练日之间会错开主要疲劳部位，降低下背、肩带和肘臂的重复负担。`,
        `每日摘要分别是：${days.map((day) => `${day.label}${day.summary}`).join("；")}。这让整周重点清晰，也方便你后续逐步做负重或次数递进。`,
      ],
    };
  }
}
