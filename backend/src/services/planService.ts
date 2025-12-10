import { Plan } from "../models/plan";
import { getAllPlans } from "../infraestructure/repositories/PlanRepository";
import {
  applyFilters,
  filterCity,
  filterMaxPrice,
  filterOperator,
  filterUsageType,
  getSpeedRuleByUsage,
  SpeedRule,
  UsageType,
} from "./utils/filters";
import {
  OrderInterface,
  orderPlans,
  SortedInterface,
} from "./utils/ordernations";
import { parseSpeedMbps } from "./utils/parsed";

export interface PlanSearchFilters {
  minPrice?: number;
  maxPrice?: number;
  minDataCap?: number;
  maxDataCap?: number;
  operator?: string;
  city?: string;
  name?: string;
  sorted?: string;
  order?: string;
}

export interface RecommendationFilters {
  typeUse?: UsageType;
  city?: string;
  maxPrice?: number;
  operator?: string;
}

export type RecommendedPlan = Plan & { emphasis?: boolean };

export interface PaginatedPlans {
  plans: Plan[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

//Variables control default
let filteredPlansCache: Plan[] | null = null;
let lastFiltersCache: string | null = null;

type FilterOptions = { minSpeedMbps?: number; maxPrice?: number };

export async function filtersPlansBySpeedAndPrice(opts: FilterOptions = {}): Promise<Plan[]> {
  const { minSpeedMbps, maxPrice } = opts;

  //Listagem de todos os planos que antes vinha do controller
  const plans = getAllPlans();

  try {
    return plans.filter((plan) => {
      const speedMbps = parseSpeedMbps(plan.speed);

      if (minSpeedMbps && speedMbps < minSpeedMbps) return false;

      if (maxPrice && plan.price > maxPrice) return false;

      return true;
    });
  } catch (error) {
    throw error;
  }
}

export async function searchPlans(
  filters: PlanSearchFilters,
  page: number = 1,
  pageSize: number = 5
): Promise<PaginatedPlans> {
  const filtersKey = JSON.stringify(filters);

  try {
    if (lastFiltersCache !== filtersKey) {
      let filtered = getAllPlans();

      filtered = applyFilters(filtered, filters);
      filteredPlansCache = filtered;
      lastFiltersCache = filtersKey;
    }

    const filteredPlansOrder = orderPlans(
      filteredPlansCache,
      filters.sorted as SortedInterface,
      filters.order as OrderInterface
    );

    const total = filteredPlansOrder ? filteredPlansOrder.length : 0;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const plans = filteredPlansOrder
      ? filteredPlansOrder.slice(start, end)
      : [];

    return {
      plans,
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error: any) {
    throw error;
  }
}

function calculateSpeedDeviation(speedMbps: number, rule?: SpeedRule): number {
  if (!rule || (rule.min === undefined && rule.max === undefined)) return 0;

  // Outside of the preferred range gets a heavy penalty.
  if (rule.min !== undefined && speedMbps < rule.min) return rule.min - speedMbps;
  if (rule.max !== undefined && speedMbps > rule.max) return speedMbps - rule.max;

  // Inside the range, prefer the midpoint (lower weight to keep ties tight).
  if (rule.min !== undefined && rule.max !== undefined) {
    const midpoint = (rule.min + rule.max) / 2;
    return Math.abs(speedMbps - midpoint) * 0.001;
  }

  return 0;
}

function buildRecommendationScore(plan: Plan, rule: SpeedRule | undefined, maxPrice?: number): number {
  const speedMbps = parseSpeedMbps(plan.speed);
  const speedDeviation = calculateSpeedDeviation(speedMbps, rule);
  const priceDistance = maxPrice !== undefined ? Math.abs(plan.price - maxPrice) : plan.price;

  // Speed compliance is the strongest factor; price refines ordering.
  return speedDeviation * 1000 + priceDistance;
}

export async function recommendPlans(filters: RecommendationFilters): Promise<RecommendedPlan[]> {
  const { typeUse, city, maxPrice, operator } = filters;
  const speedRule = getSpeedRuleByUsage(typeUse);

  let plans = getAllPlans();

  plans = filterCity(plans, city);
  plans = filterMaxPrice(plans, maxPrice);
  plans = filterOperator(plans, operator);
  plans = filterUsageType(plans, typeUse);

  const ranked = plans
    .map((plan) => ({
      plan,
      score: buildRecommendationScore(plan, speedRule, maxPrice),
    }))
    .sort((a, b) => a.score - b.score || a.plan.price - b.plan.price);

  return ranked.map((entry, index) => ({
    ...entry.plan,
    emphasis: index === 0,
  }));
}

export async function getAllPlansOnlyWithPrice():Promise< Plan[]> {
  try {
    return getAllPlans()
      .filter((plan) => plan.price !== undefined && plan.price !== null)
      .map((plan) => ({ ...plan, name: plan.name.toUpperCase() }));
  } catch (error: any) {
    throw error;
  }
}
