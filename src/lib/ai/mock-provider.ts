import type {
  AiNutritionContent,
  NutritionDayType,
} from "@/features/nutrition/types";
import type {
  AiNutritionContext,
  AiNutritionProvider,
} from "@/lib/ai/types";

function dayTypeLabel(dayType: NutritionDayType) {
  return dayType === "training" ? "训练日" : "休息日";
}

function allergySuffix(allergies: string[]) {
  return allergies.length ? `，并避开 ${allergies.join("、")}` : "";
}

function buildReasoning(context: AiNutritionContext) {
  const {
    request,
    calculation,
    ruleMeta: { proteinPerKg, fatPerKg },
  } = context;
  const goalLabel =
    request.goal === "fat_loss"
      ? "减脂"
      : request.goal === "muscle_gain"
        ? "增肌"
        : "维持";

  return [
    `你的维持热量约为 ${calculation.maintenanceCalories} kcal，目标热量定在 ${calculation.targetCalories} kcal，是按照 ${goalLabel} 目标在维持热量基础上做出的温和调整，既能推进目标，也更容易长期执行。`,
    `蛋白质设定为 ${calculation.proteinG} g，约等于每公斤体重 ${proteinPerKg.toFixed(1)} g，目的是在控热量或增肌阶段都尽量保住肌肉量、提升恢复速度和饱腹感。`,
    `即使是减脂，也不建议把碳水压得过低。你目前安排 ${calculation.carbsG} g 碳水，是为了保证训练表现、日常精神状态和整体依从性，避免因为过低碳水导致暴食或训练质量下滑。`,
    `脂肪安排为 ${calculation.fatG} g，约等于每公斤体重 ${fatPerKg.toFixed(1)} g。脂肪过低会影响激素合成、饱腹感和脂溶性维生素吸收，所以不能一味往下砍。`,
    request.dayType === "training"
      ? "今天按训练日处理，碳水更应该吃够，尤其适合把主食集中在训练前后，帮助输出、恢复和肌糖原补充。"
      : "今天按休息日处理，碳水不需要集中在训练前后，但依然要保留足够主食，避免恢复不足和第二天训练没状态。",
  ];
}

function buildMealPlans(context: AiNutritionContext): AiNutritionContent["mealPlans"] {
  const { request, calculation } = context;
  const dayLabel = dayTypeLabel(request.dayType ?? "training");
  const allergyNote = allergySuffix(request.allergies);
  const proteinBase =
    request.dietPreference === "vegetarian"
      ? "豆腐、豆干、无糖豆浆、素鸡、鸡蛋"
      : "鸡胸、牛肉、鱼虾、鸡蛋、无糖酸奶";

  return {
    cafeteria: {
      summary: `${dayLabel}食堂版，优先用常见套餐凑够蛋白和主食，目标热量约 ${calculation.targetCalories} kcal${allergyNote}。`,
      breakfast: [
        "两个水煮蛋",
        "一碗燕麦粥或杂粮粥",
        "两个肉包或全麦馒头",
        "一杯无糖豆浆",
      ],
      lunch: [
        "一份清蒸鸡腿或番茄牛肉",
        "两拳头米饭",
        "一份清炒时蔬",
        "加一份豆腐或卤蛋补蛋白",
      ],
      dinner: [
        "一份鱼肉或鸡胸窗口菜",
        "一拳到一拳半米饭",
        "一份深色蔬菜",
        request.dayType === "training" ? "训练后可再补一根香蕉" : "晚餐避免过油小炒",
      ],
      snacks: [
        "无糖酸奶一杯",
        "香蕉或苹果一个",
        request.dayType === "training" ? "训练前可加面包两片" : "下午饿了加茶叶蛋两个",
      ],
      substitutions: [
        "鸡腿可换瘦牛肉、虾仁或卤牛腱",
        "米饭可换红薯、玉米、杂粮饭",
        `蛋白来源可轮换：${proteinBase}`,
      ],
    },
    convenienceStore: {
      summary: `${dayLabel}便利店版，适合通勤和时间紧张时快速执行，重点是买得到、拆开就能吃${allergyNote}。`,
      breakfast: [
        "茶叶蛋两个",
        "即食燕麦杯一份",
        "低糖高蛋白酸奶一杯",
        "香蕉一个",
      ],
      lunch: [
        "鸡胸肉即食包一份",
        "饭团两个或荞麦冷面一份",
        "即食沙拉一盒",
        "无糖豆浆一瓶",
      ],
      dinner: [
        "金枪鱼三明治或全麦鸡肉卷一份",
        "关东煮里选萝卜、鸡蛋、豆腐、魔芋",
        request.dayType === "training" ? "再补一个饭团或烤红薯" : "再补一盒毛豆",
      ],
      snacks: [
        "高蛋白牛奶或无糖酸奶",
        "小包坚果一份",
        request.dayType === "training" ? "训练前加香蕉或能量棒半根" : "休息日下午加海盐毛豆",
      ],
      substitutions: [
        "饭团可换全麦面包、玉米杯或红薯",
        "鸡胸肉包可换卤蛋、豆腐干、低糖奶酪",
        "沙拉没有时，用小番茄和黄瓜杯替代",
      ],
    },
    fitnessStandard: {
      summary: `${dayLabel}健身党标准版，更适合自己准备餐食，食材简单、蛋白清晰、主食分配稳定${allergyNote}。`,
      breakfast: [
        "燕麦 60g 煮粥",
        "鸡蛋 3 个",
        "全麦吐司 4 片",
        "一份蓝莓或香蕉",
      ],
      lunch: [
        "煎鸡胸或瘦牛肉 180g",
        "熟米饭 250g",
        "西兰花、胡萝卜、蘑菇一大份",
        "橄榄油少量拌蔬菜",
      ],
      dinner: [
        "三文鱼或虾仁 180g",
        request.dayType === "training" ? "土豆或米饭 220g" : "土豆或米饭 160g",
        "菠菜或生菜一大份",
        "豆腐半盒",
      ],
      snacks: [
        request.dayType === "training" ? "训练前乳清一份加香蕉一根" : "下午无糖酸奶加一小把坚果",
        request.dayType === "training" ? "训练后贝果一个或米饼两片" : "睡前低脂奶或无糖豆浆一杯",
      ],
      substitutions: [
        "鸡胸可换火鸡腿肉、虾仁、鳕鱼、里脊",
        "米饭可换荞麦面、意面、红薯、藜麦",
        "乳制品不适应时可换无糖豆浆、豆腐、毛豆",
      ],
    },
  };
}

export function generateDeterministicNutritionContent(
  context: AiNutritionContext,
): AiNutritionContent {
  return {
    reasoning: buildReasoning(context),
    mealPlans: buildMealPlans(context),
  };
}

export class MockNutritionProvider implements AiNutritionProvider {
  async generateNutritionPlan(context: AiNutritionContext) {
    return generateDeterministicNutritionContent(context);
  }
}
