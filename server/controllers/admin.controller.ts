import { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin.service";

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getStatsService();
    res.json(stats);
  } catch (error: any) {
    next(error);
  }
};

export const getInventoryHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await adminService.getInventoryHistoryService();
    res.json(history);
  } catch (error: any) {
    next(error);
  }
};
