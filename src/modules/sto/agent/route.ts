import express from "express";
import { validate } from "express-validation"
import { ControllerInterface } from "../../../interfaces/controller.interface";
import jwtVerification from "../../../middlewares/verify.middleware";
import { agentController } from "./controller";
import validator from "./validator";

class AgentRoute implements ControllerInterface {
  public path = "/sto/agent";

  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }
  public initializeRoutes() {
    this.router.get(`${this.path}/proposalList`,
      jwtVerification.verifyToken,
      agentController.proposalList);

    this.router.post(`${this.path}/invested_particular_proposal`,
      // jwtVerification.verifyToken,
      agentController.invested_users_particular_proposal);

    this.router.post(`${this.path}/mint_invested_particular_proposal`,
      // jwtVerification.verifyToken,
      agentController.mint_invested_particular_proposal);

    this.router.post(`${this.path}/update_aprrove_proposal`,
      // jwtVerification.verifyToken,
      agentController.update_aprrove_proposal);


    // this.router.get(`${this.path}/get_approval_for_mint`,
    //   // jwtVerification.verifyToken,
    //   agentController.get_approval_for_mint);

    this.router.post(`${this.path}/update_approval_for_mint`,
      // jwtVerification.verifyToken,
      agentController.update_approval_for_mint);

    this.router.get(`${this.path}/mint_invested_admin_download_csv`,
      // jwtVerification.verifyToken,
      agentController.mint_invested_admin_download_csv);

    this.router.get(`${this.path}/invested_particular_proposal_download_csv`,
      // jwtVerification.verifyToken,
      agentController.invested_particular_proposal_download_csv);

      this.router.get(`${this.path}/secondaryProposalList`,
      // jwtVerification.verifyToken,
      agentController.secondaryProposalData);

      this.router.post(`${this.path}/secondaryPoposalsOfProposal`,
      // jwtVerification.verifyToken,
      agentController.secondaryPoposalsOfProposalData);

      this.router.get(`${this.path}/secondaryMarketTransaction`,
      // jwtVerification.verifyToken,
      agentController.secondaryMarketTransactionData);

      
      
  }
}

export default AgentRoute;
