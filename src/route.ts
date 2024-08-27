import express from "express";
import { userController } from "./controller/userController";

const router = express.Router();

router.post('/signup',userController.signup)
router.post('/login',userController.login)
router.post('/createPoll',userController.createPoll)
router.get('/getPolls',userController.getAllPolls)
router.get('/poll/:pollId',userController.getPollById)
router.get('/myPolls/:id',userController.getPollsByCreatorId)
router.post('/vote/:id',userController.vote)

export default router;