import { Card } from "@/components/ui/card";
import { Flame, Beef, Wheat, Droplets, Leaf, AlertCircle, Package, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

import { NutritionData } from "@/hooks/useProductSearch";

interface NutritionDisplayProps {
  data: NutritionData;
}

type ValidGrade = "a" | "b" | "c" | "d" | "e";

const GRADE_CONFIG: Record<ValidGrade, {
  bg: string;
  text: string;
  border: string;
  glow: string;
  healthLabel: string;
  healthIcon: React.ReactNode;
  recommendation: string;
  healthBg: string;
  healthText: string;
}> = {
  a: {
    bg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    text: "text-white",
    border: "border-emerald-400/30",
    glow: "0 0 40px hsl(152 80% 40% / 0.5)",
    healthLabel: "Excellent Choice",
    healthIcon: <CheckCircle className="h-5 w-5" />,
    recommendation: "Great choice – safe to consume regularly",
    healthBg: "bg-emerald-500/10",
    healthText: "text-emerald-600 dark:text-emerald-400",
  },
  b: {
    bg: "bg-gradient-to-br from-lime-500 to-lime-600",
    text: "text-white",
    border: "border-lime-400/30",
    glow: "0 0 40px hsl(84 80% 45% / 0.5)",
    healthLabel: "Healthy",
    healthIcon: <CheckCircle className="h-5 w-5" />,
    recommendation: "Good choice – safe to consume regularly",
    healthBg: "bg-lime-500/10",
    healthText: "text-lime-600 dark:text-lime-400",
  },
  c: {
    bg: "bg-gradient-to-br from-yellow-400 to-amber-500",
    text: "text-amber-900",
    border: "border-yellow-400/30",
    glow: "0 0 40px hsl(48 95% 50% / 0.5)",
    healthLabel: "Moderate",
    healthIcon: <AlertTriangle className="h-5 w-5" />,
    recommendation: "Consume in moderation",
    healthBg: "bg-yellow-500/10",
    healthText: "text-amber-600 dark:text-amber-400",
  },
  d: {
    bg: "bg-gradient-to-br from-orange-500 to-orange-600",
    text: "text-white",
    border: "border-orange-400/30",
    glow: "0 0 40px hsl(28 95% 55% / 0.5)",
    healthLabel: "Unhealthy",
    healthIcon: <XCircle className="h-5 w-5" />,
    recommendation: "Limit consumption – choose healthier alternatives",
    healthBg: "bg-orange-500/10",
    healthText: "text-orange-600 dark:text-orange-400",
  },
  e: {
    bg: "bg-gradient-to-br from-red-500 to-red-600",
    text: "text-white",
    border: "border-red-400/30",
    glow: "0 0 40px hsl(0 80% 55% / 0.5)",
    healthLabel: "Avoid",
    healthIcon: <XCircle className="h-5 w-5" />,
    recommendation: "Unhealthy – avoid or remove from diet",
    healthBg: "bg-red-500/10",
    healthText: "text-red-600 dark:text-red-400",
  },
};

const ALL_GRADES: ValidGrade[] = ["a", "b", "c", "d", "e"];

export const NutritionDisplay = ({ data }: NutritionDisplayProps) => {
  const validGrades = ["a", "b", "c", "d", "e"] as const;

  const normalizeGrade = (value: unknown): ValidGrade | undefined => {
    if (typeof value !== "string") return undefined;
    const s = value.trim().toLowerCase();
    if (!s) return undefined;
    const g = s.includes(":") ? (s.split(":").pop() ?? "") : s;
    if (validGrades.includes(g as ValidGrade)) return g as ValidGrade;
    return undefined;
  };

  const resolveNutriscoreGrade = (): ValidGrade | undefined => {
    const candidates: Array<unknown> = [
      data.nutrition_grades,
      data.nutrition_grades_tags?.[0],
      data.nutriscore_grade,
      data.nutriscore_2023_grade,
      data.nutriscore_2021_grade,
      data.nutrition_grade_fr,
      (data as unknown as { nutriscore?: { grade?: unknown; nutriscore_grade?: unknown } }).nutriscore?.grade,
      (data as unknown as { nutriscore?: { grade?: unknown; nutriscore_grade?: unknown } }).nutriscore?.nutriscore_grade,
      (data as unknown as { nutriscore_data?: { grade?: unknown } }).nutriscore_data?.grade,
    ];

    for (const candidate of candidates) {
      const g = normalizeGrade(candidate);
      if (g) return g;
    }

    console.debug("Nutri-Score not found. Candidates:", {
      nutrition_grades: data.nutrition_grades,
      nutrition_grades_tags: data.nutrition_grades_tags,
      nutriscore_grade: data.nutriscore_grade,
      nutriscore_2023_grade: data.nutriscore_2023_grade,
      nutriscore_2021_grade: data.nutriscore_2021_grade,
      nutrition_grade_fr: data.nutrition_grade_fr,
      nutriscore: (data as any).nutriscore,
      nutriscore_data: (data as any).nutriscore_data,
    });

    return undefined;
  };

  const nutriscoreGrade = resolveNutriscoreGrade();
  const gradeConfig = nutriscoreGrade ? GRADE_CONFIG[nutriscoreGrade] : null;

  return (
    <div className="relative space-y-4">
      {/* Outer glow */}
      <div className="absolute -inset-3 bg-gradient-to-b from-primary/8 via-primary/4 to-transparent rounded-[2.5rem] blur-2xl pointer-events-none" />
      
      {/* Nutri-Score Section */}
      <Card className="relative glass-card gradient-border inner-glow overflow-hidden rounded-3xl" style={{ boxShadow: 'var(--shadow-elevated)' }}>
        <div className="p-6">
          <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5 text-center">
            Nutri-Score Rating
          </h3>
          
          {/* Grade Scale */}
          <div className="flex justify-center gap-2 mb-6">
            {ALL_GRADES.map((grade) => {
              const isActive = nutriscoreGrade === grade;
              const config = GRADE_CONFIG[grade];
              return (
                <div
                  key={grade}
                  className={`
                    relative flex items-center justify-center rounded-xl font-display font-bold text-xl uppercase transition-all duration-300
                    ${isActive 
                      ? `${config.bg} ${config.text} w-16 h-16 scale-110 ${config.border} border-2` 
                      : 'bg-muted/40 text-muted-foreground/40 w-12 h-12 border border-border/30'
                    }
                  `}
                  style={isActive ? { boxShadow: config.glow } : {}}
                >
                  {grade.toUpperCase()}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-current opacity-60" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Health Status & Recommendation */}
          {gradeConfig ? (
            <div className={`rounded-2xl ${gradeConfig.healthBg} p-4 space-y-3 border ${gradeConfig.border}`}>
              <div className={`flex items-center justify-center gap-2 ${gradeConfig.healthText} font-bold text-lg`}>
                {gradeConfig.healthIcon}
                <span>{gradeConfig.healthLabel}</span>
              </div>
              <p className={`text-center text-sm ${gradeConfig.healthText} opacity-80`}>
                {gradeConfig.recommendation}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/30">
              <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
                <AlertCircle className="h-5 w-5" />
                <span>Nutri-Score unavailable for this product</span>
              </div>
              <p className="text-center text-sm text-muted-foreground/70 mt-2">
                This product doesn't have a Nutri-Score rating in the database
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Product Info Card */}
      <Card className="relative glass-card gradient-border inner-glow overflow-hidden rounded-3xl" style={{ boxShadow: 'var(--shadow-elevated)' }}>
        {/* Product Header */}
        <div className="p-6 pb-0">
          <div className="flex gap-5">
            {data.image_url ? (
              <div className="relative flex-shrink-0 group">
                <div className="absolute inset-0 bg-primary/15 blur-xl rounded-2xl transition-all duration-300 group-hover:bg-primary/25" />
                <img
                  src={data.image_url}
                  alt={data.product_name}
                  className="relative w-24 h-24 object-contain rounded-2xl bg-card border border-border/50 shadow-sm transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0 border border-border/30">
                <Package className="h-8 w-8 text-muted-foreground/40" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-bold text-foreground mb-1 line-clamp-2 leading-tight">
                {data.product_name}
              </h2>
              {data.brands && (
                <p className="text-sm text-muted-foreground font-medium">{data.brands}</p>
              )}
            </div>
          </div>
        </div>

        {/* Divider with gradient */}
        <div className="px-6 py-5">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Nutrition Facts - only show when nutriments data is available */}
        {data.nutriments && (
          <div className="px-6 pb-6">
            <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>Nutrition Facts</span>
              <span className="text-[10px] font-medium normal-case tracking-normal opacity-60">(per 100g)</span>
            </h3>
            
            {/* Main nutrients grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <NutritionCard
                icon={<Flame className="h-5 w-5" />}
                label="Calories"
                value={data.nutriments["energy-kcal_100g"]}
                unit="kcal"
                gradient="from-orange-500/15 via-orange-500/8 to-red-500/5"
                iconColor="text-orange-500"
                iconGlow="hsl(24 95% 55% / 0.3)"
              />
              <NutritionCard
                icon={<Beef className="h-5 w-5" />}
                label="Protein"
                value={data.nutriments.proteins_100g}
                unit="g"
                gradient="from-rose-500/15 via-rose-500/8 to-pink-500/5"
                iconColor="text-rose-500"
                iconGlow="hsl(350 90% 55% / 0.3)"
              />
              <NutritionCard
                icon={<Wheat className="h-5 w-5" />}
                label="Carbs"
                value={data.nutriments.carbohydrates_100g}
                unit="g"
                gradient="from-amber-500/15 via-amber-500/8 to-yellow-500/5"
                iconColor="text-amber-500"
                iconGlow="hsl(38 95% 55% / 0.3)"
              />
              <NutritionCard
                icon={<Droplets className="h-5 w-5" />}
                label="Fat"
                value={data.nutriments.fat_100g}
                unit="g"
                gradient="from-sky-500/15 via-sky-500/8 to-blue-500/5"
                iconColor="text-sky-500"
                iconGlow="hsl(200 90% 55% / 0.3)"
              />
            </div>

            {/* Secondary nutrients */}
            {(data.nutriments.fiber_100g !== undefined || data.nutriments.sodium_100g !== undefined) && (
              <div className="rounded-2xl bg-gradient-to-br from-muted/60 to-muted/30 backdrop-blur-sm p-4 space-y-3 border border-border/30">
                {data.nutriments.fiber_100g !== undefined && (
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-muted-foreground flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center transition-colors duration-200 group-hover:bg-emerald-500/20">
                        <Leaf className="h-4 w-4 text-emerald-500" />
                      </div>
                      Fiber
                    </span>
                    <span className="font-bold text-foreground tabular-nums">
                      {data.nutriments.fiber_100g.toFixed(1)}
                      <span className="text-muted-foreground font-medium ml-0.5">g</span>
                    </span>
                  </div>
                )}
                {data.nutriments.sodium_100g !== undefined && (
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-muted-foreground flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center transition-colors duration-200 group-hover:bg-violet-500/20">
                        <AlertCircle className="h-4 w-4 text-violet-500" />
                      </div>
                      Sodium
                    </span>
                    <span className="font-bold text-foreground tabular-nums">
                      {(data.nutriments.sodium_100g * 1000).toFixed(0)}
                      <span className="text-muted-foreground font-medium ml-0.5">mg</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Loading skeleton for nutriments when partial data */}
        {!data.nutriments && data._isPartial && (
          <div className="px-6 pb-6">
            <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>Nutrition Facts</span>
              <span className="text-[10px] font-medium normal-case tracking-normal opacity-60">(loading...)</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl bg-muted/30 p-4 animate-pulse h-24" />
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

interface NutritionCardProps {
  icon: React.ReactNode;
  label: string;
  value?: number;
  unit: string;
  gradient: string;
  iconColor: string;
  iconGlow: string;
}

const NutritionCard = ({ icon, label, value, unit, gradient, iconColor, iconGlow }: NutritionCardProps) => (
  <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-4 border border-border/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group`}>
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    
    <div className="flex items-center gap-2.5 mb-2.5">
      <div 
        className={`${iconColor} transition-transform duration-300 group-hover:scale-110`}
        style={{ filter: `drop-shadow(0 2px 8px ${iconGlow})` }}
      >
        {icon}
      </div>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    <div className="font-display text-2xl font-bold text-foreground tabular-nums">
      {value !== undefined ? value.toFixed(1) : "N/A"}
      <span className="text-sm font-semibold text-muted-foreground ml-1">{unit}</span>
    </div>
  </div>
);