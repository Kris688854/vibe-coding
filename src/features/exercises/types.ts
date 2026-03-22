export type MuscleSummary = {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  category: string;
  color: string;
};

export type ExerciseListItem = {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  category: string;
  difficulty: string;
  equipment: string[];
};

export type MuscleHighlightMap = {
  primaryMeshKeys: string[];
  secondaryMeshKeys: string[];
};

export type ExerciseDetail = ExerciseListItem &
  MuscleHighlightMap & {
    description: string;
    instructions: string[];
    heroMeshKeys: string[];
    primaryMuscles: MuscleSummary[];
    secondaryMuscles: MuscleSummary[];
  };

export type ExerciseCategorySummary = {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
  count: number;
};

export type ExerciseCatalogResponse = {
  categories: ExerciseCategorySummary[];
  selectedCategory: string;
  defaultSelectedId: string | null;
  exercises: ExerciseListItem[];
};

