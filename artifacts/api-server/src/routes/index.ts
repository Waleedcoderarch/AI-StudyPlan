import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import notesRouter from "./notes";
import quizRouter from "./quiz";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(notesRouter);
router.use(quizRouter);
router.use(statsRouter);

export default router;
