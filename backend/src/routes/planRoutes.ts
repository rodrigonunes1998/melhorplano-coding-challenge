import { Router } from "express";
import {
  allPlans,
  filteredPlans,
  planSearch,
  planRecomended,
} from "../controllers/planController";

const router = Router();

router.get("/", allPlans);
router.get("/filtered", filteredPlans);
router.get("/search", planSearch);
router.get("/recomended", planRecomended);

export default router;
