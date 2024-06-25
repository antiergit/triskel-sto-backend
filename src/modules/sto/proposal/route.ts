import express from "express";
import { validate } from "express-validation"
import { ControllerInterface } from "../../../interfaces/controller.interface";
import jwtVerification from "../../../middlewares/verify.middleware";
import { proposalController } from "./controller";
import validator from "./validator";
import schedule from 'node-schedule';
import PolyMiddleware from "../../middleware/polyMiddleware"



class ProposalRoute implements ControllerInterface {
  public path = "/sto/proposal";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {

    this.router.get(`${this.path}/proposalList`,
      jwtVerification.verifyToken,
      proposalController.proposalList);

    this.router.post(`${this.path}/priceConversion`,
      jwtVerification.verifyToken,
      proposalController.priceConversion)

    this.router.post(`${this.path}/orderPrimaryProposal`,
      jwtVerification.verifyToken,
      proposalController.orderPrimaryProposal)

    this.router.post(`${this.path}/cancel_order`,
      jwtVerification.verifyToken,
      proposalController.order_checkout_cancel_event);

    this.router.get(`${this.path}/kyc_status`,
      jwtVerification.verifyToken,
      proposalController.kyc_status);

    this.router.post(`${this.path}/checkLiquidity`,
      jwtVerification.verifyToken,
      proposalController.checkLiquidity);

    this.router.post(`${this.path}/:coin/create_transaction`,
      jwtVerification.verifyToken,
      PolyMiddleware.requestInfo,
      proposalController.createTransaction);

    this.router.post(`${this.path}/create_liminal_address`,
      jwtVerification.verifyToken,
      proposalController.create_liminal_address);

    this.router.get(`${this.path}/holding_primary_proposal`,
      jwtVerification.verifyToken,
      proposalController.holdingPrimaryProposalList);

    this.router.post(`${this.path}/viewParticularProposal`,
      jwtVerification.verifyToken,
      proposalController.viewParticularProposal);

    this.router.post(`${this.path}/create_wallet`,
      [validate(validator.create_wallet_validate)],
      jwtVerification.verifyToken,
      proposalController.create_wallet)

    this.router.post(`${this.path}/get_coin_choose_by_option`,
      jwtVerification.verifyToken,
      proposalController.get_coin_choose_by_option);

    this.router.post(`${this.path}/transactionHistory`,
      jwtVerification.verifyToken,
      proposalController.transactionHistory);

    this.router.post(`${this.path}/portfolio`,
      jwtVerification.verifyToken,
      proposalController.portfolioList);

    this.router.post(`${this.path}/sendData`,
      jwtVerification.verifyToken,
      proposalController.sendData);

    this.router.get(`${this.path}/primary_secondary_percentage`,
      jwtVerification.verifyToken,
      proposalController.primary_secondary_percentage)

    this.router.post(`${this.path}/create_proposal_wallet`,
      jwtVerification.verifyToken,
      proposalController.create_proposal_wallet);

    this.router.post(`${this.path}/notifications`,
      // [validate(validator.notifications)],
      jwtVerification.verifyToken,
      proposalController.notifications);

    this.router.post(`${this.path}/get_perposal_wallet`,
      jwtVerification.verifyToken,
      proposalController.get_perposal_wallet);

    this.router.post(`${this.path}/perposal_assets`,
      jwtVerification.verifyToken,
      proposalController.perposal_assets);

      this.router.post(`${this.path}/getCombinedAssets`,
      jwtVerification.verifyToken,
      proposalController.getCombinedAssetsData);

      

    this.router.post(`${this.path}/send_tokens`,
      jwtVerification.verifyToken,
      proposalController.sendToken);

    this.router.post(`${this.path}/updateBalance`,
    jwtVerification.verifyToken,
    proposalController.updateWalletBalance);

    this.router.post(`${this.path}/generateSecondaryProposalWallet`,
    jwtVerification.verifyToken,
    proposalController.createSecondaryProposalWallet);

    this.router.post(`${this.path}/singleProposalBalance`,
    jwtVerification.verifyToken,
    proposalController.getSingleProposalBalance);

    this.router.get(`${this.path}/getStoDynamicData`,
    jwtVerification.verifyToken,
    proposalController.getStoDynamicDataList);


     
  }

}

export default ProposalRoute;
