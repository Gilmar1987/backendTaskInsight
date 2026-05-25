import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";



export const validarIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (id && !isValidObjectId(id)) {
        return res.status(400).json({
            message: `Invalid ID format for ${id}`
        });
    }
    next();
};