import assert from "node:assert/strict";
import {
  generateTrainingPlanFromRules,
  getTrainingDayTemplates,
  loadEligibleExercises,
} from "../src/server/services/training-plan-rules";
import type {
  SplitType,
  TrainingDaysPerWeek,
  TrainingPlanRequest,
} from "../src/features/training-plan/types";

const bicepsIsolationIds = new Set([
  "barbell_curl",
  "dumbbell_curl",
  "hammer_curl",
  "preacher_curl",
]);

const tricepsIsolationIds = new Set([
  "tricep_pushdown",
  "skull_crusher",
  "overhead_tricep_extension",
]);

function baseRequest(
  splitType: SplitType,
  trainingDaysPerWeek: TrainingDaysPerWeek,
): TrainingPlanRequest {
  return {
    goal: "maintain",
    trainingDaysPerWeek,
    experienceLevel: "intermediate",
    splitType,
    equipmentAccess: "gym",
    sessionDurationMinutes: 60,
    restrictions: [],
  };
}

async function verifySplit(splitType: SplitType, trainingDaysPerWeek: TrainingDaysPerWeek) {
  console.log(`Checking ${splitType} / ${trainingDaysPerWeek} days`);
  const request = baseRequest(splitType, trainingDaysPerWeek);
  const [plan, templates, pool] = await Promise.all([
    generateTrainingPlanFromRules(request),
    Promise.resolve(getTrainingDayTemplates(request)),
    loadEligibleExercises(request),
  ]);

  const lookup = new Map(pool.map((exercise) => [exercise.id, exercise]));

  for (const [index, template] of templates.entries()) {
    console.log(`  Day ${index + 1}: ${template.dayType}`);
    const day = plan.days[index];
    const ids = day.exercises.map((exercise) => exercise.exerciseId);
    const categories = day.exercises.map((exercise) => exercise.category);
    const targets = day.exercises.flatMap(
      (exercise) => lookup.get(exercise.exerciseId)?.primaryTargets ?? [],
    );

    if (template.dayType === "chest" || template.dayType === "push") {
      assert.equal(
        ids.some((id) => bicepsIsolationIds.has(id)),
        false,
        `${splitType}-${trainingDaysPerWeek} chest/push day should not include biceps isolation`,
      );
    }

    if (template.dayType === "back" || template.dayType === "pull") {
      assert.equal(
        ids.some((id) => tricepsIsolationIds.has(id)),
        false,
        `${splitType}-${trainingDaysPerWeek} back/pull day should not include triceps isolation`,
      );
    }

    if (template.dayType === "shoulders") {
      assert.equal(
        categories.includes("arms"),
        false,
        `${splitType}-${trainingDaysPerWeek} shoulder day should not center arm isolation`,
      );
      assert.equal(
        lookup.get(ids[0])?.primaryTargets.includes("shoulders") ?? false,
        true,
        `${splitType}-${trainingDaysPerWeek} shoulder day first move should be a shoulder move`,
      );
    }

    if (template.dayType === "upper") {
      assert.equal(
        categories.slice(0, 3).includes("arms"),
        false,
        `${splitType}-${trainingDaysPerWeek} upper day should not let arm isolation occupy core slots`,
      );
    }

    if (template.dayType === "legs" || template.dayType === "lower") {
      assert.equal(
        targets.includes("quadriceps"),
        true,
        `${splitType}-${trainingDaysPerWeek} leg day should include quadriceps`,
      );
      assert.equal(
        targets.includes("gluteus"),
        true,
        `${splitType}-${trainingDaysPerWeek} leg day should include gluteus`,
      );
      assert.equal(
        targets.includes("hamstrings"),
        true,
        `${splitType}-${trainingDaysPerWeek} leg day should include hamstrings`,
      );
    }
  }
}

async function verifyRestrictions() {
  const noSquat = await generateTrainingPlanFromRules({
    ...baseRequest("upper-lower", 4),
    restrictions: ["no_squat"],
  });
  const noDeadlift = await generateTrainingPlanFromRules({
    ...baseRequest("upper-lower", 4),
    restrictions: ["no_deadlift"],
  });
  const noOverhead = await generateTrainingPlanFromRules({
    ...baseRequest("bro-split", 5),
    restrictions: ["no_overhead_press"],
  });

  const flatten = (plan: Awaited<ReturnType<typeof generateTrainingPlanFromRules>>) =>
    plan.days.flatMap((day) => day.exercises.map((exercise) => exercise.exerciseId));

  assert.equal(
    flatten(noSquat).some((id) => ["barbell_squat", "front_squat"].includes(id)),
    false,
    "no_squat should remove squat variants",
  );
  assert.equal(
    flatten(noDeadlift).some((id) => ["deadlift", "romanian_deadlift"].includes(id)),
    false,
    "no_deadlift should remove deadlift variants",
  );
  assert.equal(
    flatten(noOverhead).some((id) =>
      ["overhead_press", "dumbbell_shoulder_press", "arnold_press"].includes(id),
    ),
    false,
    "no_overhead_press should remove overhead pressing variants",
  );
}

async function main() {
  const splits: SplitType[] = ["bro-split", "ppl", "upper-lower", "full-body"];
  const days: TrainingDaysPerWeek[] = [4, 5, 6];

  for (const split of splits) {
    for (const dayCount of days) {
      await verifySplit(split, dayCount);
    }
  }

  await verifyRestrictions();
  console.log("Training rule verification passed for 4-6 day splits.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
