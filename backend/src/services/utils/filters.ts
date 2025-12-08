import { Plan } from "../../models/plan";
import { parseSpeedMbps } from "./parsed";

export type UsageType = "tv" | "chat" | "app" | "gamer" | string;

export type SpeedRule = {
  min?: number;
  max?: number;
};

const USAGE_SPEED_RULES: Record<string, SpeedRule> = {
  tv: { min: 100, max: 400 },
  chat: { min: 50, max: 200 },
  app: { min: 50, max: 200 },
  gamer: { min: 400 },
};

export function filterMinPrice(plans: Plan[], minPrice?: number): Plan[] {
  if (minPrice === undefined) return plans;

  return plans.filter((plan: Plan) => plan.price >= minPrice);
}

export function filterMaxPrice(plans: Plan[], maxPrice?: number): Plan[] {
  if (maxPrice === undefined) return plans;

  return plans.filter((plan: Plan) => plan.price <= maxPrice);
}

export function filterMinDataCap(plans: Plan[], minDataCap?: number) :Plan[] {
  if (minDataCap === undefined) return plans;

  return plans.filter((plan: Plan) => plan.dataCap >= minDataCap);
}

export function filterMaxDataCap(plans: Plan[], maxDataCap?: number): Plan[] {
  if (maxDataCap === undefined) return plans;

  return plans.filter((plan: Plan) => plan.dataCap <= maxDataCap);
}

export function filterOperator(plans: Plan[], operator?: string): Plan[] {
  if (operator === undefined) return plans;

  return plans.filter(
    (plan: Plan) => plan.operator.toLowerCase() === operator.toLowerCase()
  );
}

export function filterCity(plans: Plan[], city?: string): Plan[]{
    if(city === undefined) return plans;

    return plans.filter((plan: Plan)=> plan.city.toLowerCase() === city.toLowerCase())
}

export function filterName(plans: Plan[], name?: string): Plan[]{
    if(name === undefined) return plans; 

    return plans.filter((plan: Plan)=> plan.name.toLowerCase() === name.toLowerCase());
}

export function getSpeedRuleByUsage(typeUse?: UsageType): SpeedRule | undefined {
  if (!typeUse) return undefined;
  const key = typeUse.toLowerCase();
  return USAGE_SPEED_RULES[key];
}

export function filterUsageType(plans: Plan[], typeUse?: UsageType): Plan[] {
  const rule = getSpeedRuleByUsage(typeUse);
  if (!rule) return plans;

  return plans.filter((plan: Plan) => {
    const speed = parseSpeedMbps(plan.speed);
    if (rule.min !== undefined && speed < rule.min) return false;
    if (rule.max !== undefined && speed > rule.max) return false;
    return true;
  });
}


export function applyFilters(plans: Plan[], filters: {
  minPrice?: number;
  maxPrice?: number;
  minDataCap?: number;
  maxDataCap?: number;
  operator?: string;
  city?: string;
  name?: string;
}) {
  return [
    filterMinPrice,
    filterMaxPrice,
    filterMinDataCap,
    filterMaxDataCap,
    filterOperator,
    filterCity,
    filterName
  ].reduce((acc, fn) => fn(acc, (filters as any)[fn.name.replace("filter", "").charAt(0).toLowerCase() + fn.name.replace("filter", "").slice(1)]), plans);
}
