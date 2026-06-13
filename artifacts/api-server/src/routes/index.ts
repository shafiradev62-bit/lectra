import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ar3dRouter from "./ar3d";
import visionRouter from "./vision";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/ar3d", ar3dRouter);
router.use("/vision", visionRouter);

export default router;
