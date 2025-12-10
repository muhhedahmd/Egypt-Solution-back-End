// import { NextFunction  ,Request,Response} from "express";


// export class StatsController {
//     async getStats(req : Request, res :Response, next: NextFunction) {
//         try {
//             const stats = await req.context.models.Stats.findAll();
//             res.json(stats);
//         } catch (error) {
//             next(error);
//         }
//     }
// }