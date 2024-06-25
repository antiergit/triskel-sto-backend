import express from "express";
import { validate } from "express-validation"
import { ControllerInterface } from "../../../interfaces/controller.interface";
import jwtVerification from "../../../middlewares/verify.middleware";
import { SecondaryController } from "./controller";

class SecondaryRoute implements ControllerInterface {
  public path = "/sto/secondary";

  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }
  public initializeRoutes() {

    console.log("-----------------")

    this.router.post(`${this.path}/raise_quote_secondary_proposal`,
      jwtVerification.verifyToken,
      SecondaryController.raiseQuoteSecondaryProposal);

      this.router.post(`${this.path}/secondaryTransactionHistory`,
      jwtVerification.verifyToken,
      SecondaryController.transactionHistories);

    this.router.post(`${this.path}/secondaryProposalList`,
      jwtVerification.verifyToken,
      SecondaryController.secondaryProposalData);

    this.router.post(`${this.path}/sellOrders`,
      jwtVerification.verifyToken,
      SecondaryController.sellOrdersList);

    this.router.post(`${this.path}/createSecondaryOrder`,
      jwtVerification.verifyToken,
      SecondaryController.createOrderSecondaryProposal);

    this.router.post(`${this.path}/cancelOrder`,
      jwtVerification.verifyToken,
      SecondaryController.secondaryCancelOrder);

    this.router.post(`${this.path}/checkSecondaryLiquidity`,
      jwtVerification.verifyToken,
      SecondaryController.checkLiquidity)

    this.router.post(`${this.path}/:coin/createTransaction`,
      jwtVerification.verifyToken,
      SecondaryController.createSecondaryTransaction);

    this.router.post(`${this.path}/myListing`,
      jwtVerification.verifyToken,
      SecondaryController.secondaryMyListing);

    this.router.get(`${this.path}/holdingSecondaryProposal`,
      jwtVerification.verifyToken,
      SecondaryController.holdingSecondaryProposalList);


    this.router.post(`${this.path}/secondaryViewProposal`,
      jwtVerification.verifyToken,
      SecondaryController.secondaryViewParticularProposal);

    this.router.post(`${this.path}/secondaryPortfolio`,
      jwtVerification.verifyToken,
      SecondaryController.secondaryPortfolioList);

    this.router.post(`${this.path}/getSingleWalletData`,
      jwtVerification.verifyToken,
      SecondaryController.getSingleWalletAddress);

    this.router.get(`${this.path}/listOfUsdtTokens`,
      jwtVerification.verifyToken,
      SecondaryController.listOfUsdtTokens);

    this.router.post(`${this.path}/getCoinChooseByOption`, 
      jwtVerification.verifyToken,
      SecondaryController.getCoinChooseByOption);

    this.router.post(`${this.path}/cancelRequestSecondaryProposal`, 
    jwtVerification.verifyToken,
    SecondaryController.sendCancelRequestSecondaryProposal);


  }
}

export default SecondaryRoute;
