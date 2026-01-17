import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

// Essential fields for quick first render
const ESSENTIAL_FIELDS = [
  "product_name",
  "brands",
  "image_front_small_url",
  "image_url",
  "nutrition_grades",
  "nutriscore_grade",
  "nutriscore_2023_grade",
  "nutriscore_2021_grade",
  "nutrition_grade_fr",
  "nutriscore",
  "nutriscore_data",
].join(",");

// Full fields for complete data
const FULL_FIELDS = [
  "product_name",
  "brands",
  "image_url",
  "image_front_url",
  "image_front_small_url",
  "nutriments",
  "nutrition_grades",
  "nutrition_grades_tags",
  "nutriscore_grade",
  "nutriscore_2023_grade",
  "nutriscore_2021_grade",
  "nutrition_grade_fr",
  "nutriscore",
  "nutriscore_data",
].join(",");

export interface NutritionData {
  product_name: string;
  brands?: string;
  image_url?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sodium_100g?: number;
  };
  nutrition_grades?: string;
  nutrition_grades_tags?: string[];
  nutriscore_grade?: string;
  nutriscore_2023_grade?: string;
  nutriscore_2021_grade?: string;
  nutrition_grade_fr?: string;
  nutriscore?: { grade?: string; nutriscore_grade?: string };
  nutriscore_data?: { grade?: string };
  _isPartial?: boolean;
}

interface CacheEntry {
  data: NutritionData;
  timestamp: number;
}

// In-memory cache with 10-minute TTL
const productCache = new Map<string, CacheEntry>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const validGrades = ["a", "b", "c", "d", "e"] as const;

const normalizeGrade = (value: unknown): (typeof validGrades)[number] | undefined => {
  if (typeof value !== "string") return undefined;
  const s = value.trim().toLowerCase();
  if (!s) return undefined;
  const g = s.includes(":") ? (s.split(":").pop() ?? "") : s;
  return (validGrades as readonly string[]).includes(g) ? (g as (typeof validGrades)[number]) : undefined;
};

const hasNutriscoreGrade = (product: any): boolean => {
  const candidates: Array<unknown> = [
    product?.nutrition_grades,
    product?.nutrition_grades_tags?.[0],
    product?.nutriscore_grade,
    product?.nutriscore_2023_grade,
    product?.nutriscore_2021_grade,
    product?.nutrition_grade_fr,
    product?.nutriscore?.grade,
    product?.nutriscore?.nutriscore_grade,
    product?.nutriscore_data?.grade,
  ];
  return candidates.some((c) => Boolean(normalizeGrade(c)));
};

const getCachedProduct = (barcode: string): NutritionData | null => {
  const entry = productCache.get(barcode);
  if (!entry) return null;
  
  // Check if cache is still valid
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    productCache.delete(barcode);
    return null;
  }
  
  return entry.data;
};

const setCachedProduct = (barcode: string, data: NutritionData) => {
  productCache.set(barcode, {
    data,
    timestamp: Date.now(),
  });
};

export const useProductSearch = () => {
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<"idle" | "quick" | "full">("idle");
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchNutritionData = useCallback(async (barcode: string) => {
    const code = barcode.trim();
    if (!code) return;

    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Check cache first (instant response)
    const cached = getCachedProduct(code);
    if (cached && !cached._isPartial) {
      setNutritionData(cached);
      setIsLoading(false);
      setLoadingStage("idle");
      return;
    }

    setIsLoading(true);
    setLoadingStage("quick");

    try {
      // PHASE 1: Quick fetch with essential fields only
      const quickPromise = fetch(
        `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${ESSENTIAL_FIELDS}`,
        { signal, priority: "high" } as RequestInit
      );

      const quickResponse = await quickPromise;
      const quickData = await quickResponse.json();

      if (signal.aborted) return;

      if (quickData.status === 1 && quickData.product) {
        // Show partial data immediately
        const partialProduct: NutritionData = {
          ...quickData.product,
          image_url: quickData.product.image_front_small_url || quickData.product.image_url,
          _isPartial: true,
        };
        setNutritionData(partialProduct);
        setLoadingStage("full");

        // PHASE 2: Fetch full data in background
        const fullPromise = fetch(
          `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${FULL_FIELDS}`,
          { signal }
        );

        const fullResponse = await fullPromise;
        const fullData = await fullResponse.json();

        if (signal.aborted) return;

        if (fullData.status === 1 && fullData.product) {
          let product = fullData.product;

          // Fallback for Nutri-Score via legacy endpoint if needed
          if (!hasNutriscoreGrade(product)) {
            try {
              const legacyRes = await fetch(
                `https://world.openfoodfacts.org/api/v0/product/${code}.json`,
                { signal }
              );
              const legacy = await legacyRes.json();

              if (!signal.aborted && legacy?.status === 1 && legacy?.product) {
                product = {
                  ...product,
                  nutrition_grades: legacy.product.nutrition_grades ?? product.nutrition_grades,
                  nutrition_grades_tags: legacy.product.nutrition_grades_tags ?? product.nutrition_grades_tags,
                  nutrition_grade_fr: legacy.product.nutrition_grade_fr ?? product.nutrition_grade_fr,
                  nutriscore_grade:
                    legacy.product.nutriscore_grade ??
                    legacy.product.nutrition_grades ??
                    legacy.product.nutrition_grade_fr ??
                    product.nutriscore_grade,
                  nutriscore_data: legacy.product.nutriscore_data ?? product.nutriscore_data,
                  nutriscore: legacy.product.nutriscore ?? product.nutriscore,
                };
              }
            } catch {
              // Ignore legacy fallback errors
            }
          }

          const completeProduct: NutritionData = {
            ...product,
            image_url: product.image_front_url || product.image_url,
            _isPartial: false,
          };

          if (!signal.aborted) {
            setNutritionData(completeProduct);
            setCachedProduct(code, completeProduct);
          }
        }
      } else {
        toast.error("Product not found. Try another barcode.");
        setNutritionData(null);
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      console.error("Error fetching nutrition data:", error);
      toast.error("Failed to fetch product data. Please try again.");
      setNutritionData(null);
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
        setLoadingStage("idle");
      }
    }
  }, []);

  const clearData = useCallback(() => {
    setNutritionData(null);
    setIsLoading(false);
    setLoadingStage("idle");
  }, []);

  return {
    nutritionData,
    isLoading,
    loadingStage,
    fetchNutritionData,
    clearData,
  };
};
