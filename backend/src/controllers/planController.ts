import { Request, Response } from "express";
import {
  filtersPlansBySpeedAndPrice,
  searchPlans,
  PlanSearchFilters,
  getAllPlansOnlyWithPrice,
  recommendPlans,
  RecommendationFilters,
} from "../services/planService";

import { schemaPage } from "./schemas/schemaPage";

export async function allPlans(req: Request, res: Response) {

  try {
    const getAllPlans = await getAllPlansOnlyWithPrice();
    res.json(getAllPlans);
  } catch (error: any) {
    res.status(400).json({error: true, message: error.message});
  }
  
}

export async function filteredPlans(req: Request, res: Response) {
  const minSpeedMbps = req.query.minSpeed
    ? parseInt(req.query.minSpeed as string)
    : undefined;
  const maxPrice = req.query.maxPrice
    ? parseFloat(req.query.maxPrice as string)
    : undefined;

    try {
      const filtered = await filtersPlansBySpeedAndPrice({ minSpeedMbps, maxPrice });
      res.json(filtered);
    } catch (error: any) {
      res.status(400).json({error: true, message: error.message});
    }
  
}

export async function planSearch(req: Request, res: Response) {
  const {
    minPrice,
    maxPrice,
    minDataCap,
    maxDataCap,
    operator,
    city,
    name,
    page = "1",
    pageSize = "5",
    sorted,
    order,
  } = req.query;

  const validationPagesInfo = schemaPage.safeParse({ page, pageSize });

  if (!validationPagesInfo.success)
    return res
      .status(400)
      .json({
        error: true,
        message: "Attrbutes of page and pageSize has error",
      });

  const filters: PlanSearchFilters = {
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minDataCap: minDataCap ? Number(minDataCap) : undefined,
    maxDataCap: maxDataCap ? Number(maxDataCap) : undefined,
    operator: operator ? String(operator) : undefined,
    city: city ? String(city) : undefined,
    name: name ? String(name) : undefined,
    sorted: sorted ? String(sorted) : undefined,
    order: order ? String(order) : undefined,
  };

  try {
    const paginated = await searchPlans(filters, Number(page), Number(pageSize));
    res.json(paginated);    
  } catch (error: any) {
    res.status(400).json({error: true, message: error.message})
  }

}


export async function planRecomended(req: Request, res: Response){
  const { city, maxPrice, typeUse, operator } = req.query;

  const filters: RecommendationFilters = {
    city: city ? String(city) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    typeUse: typeUse ? String(typeUse) : undefined,
    operator: operator ? String(operator) : undefined,
  };

  try {
    const plans = await recommendPlans(filters);
    res.json({ plans, total: plans.length });
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
}
