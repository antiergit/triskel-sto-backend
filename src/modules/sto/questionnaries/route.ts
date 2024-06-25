import express from "express";
import { validate } from "express-validation"
import { ControllerInterface } from "../../../interfaces/controller.interface";
import jwtVerification from "../../../middlewares/verify.middleware";
import { questionController } from "./controller";
import validator from "./validator";

class QuestionRoute implements ControllerInterface {
  public path = "/sto/question";

  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }
  public initializeRoutes() {
    this.router.post(`${this.path}/addAnswer`,
      jwtVerification.verifyToken,
      questionController.addAnswer);

    this.router.get(`${this.path}/list`,
      questionController.questionsList);

    this.router.get(`${this.path}/category`,
      questionController.getAllcategory);

    this.router.post(`${this.path}/addNotEligbleUser`,
      jwtVerification.verifyToken,
      questionController.addNotEligbleUser);

    this.router.post(`${this.path}/invest_primary_proposal`,
      jwtVerification.verifyToken,
      questionController.invest);

    this.router.post(`${this.path}/addAddressBook`,
      jwtVerification.verifyToken,
      questionController.addAddressBook);

    this.router.get(`${this.path}/getaddressBook`,
      jwtVerification.verifyToken,
      questionController.getAddressBook);


      this.router.post(`${this.path}/getProposalWiseAddress`,
      jwtVerification.verifyToken,
      questionController.getProposalWiseAddressBook);


      

    // this.router.get(`${this.path}/getaddressBookForDropDown`,
    //   jwtVerification.verifyToken,
    //   questionController.getaddressBookForDropDown);

    this.router.get(`${this.path}/getProposalName`,
      jwtVerification.verifyToken,
      questionController.getProposalName);

    this.router.get(`${this.path}/getAllProposalName`,
      jwtVerification.verifyToken,
      questionController.getAllProposalName);

    this.router.post(`${this.path}/addQuestionarieStatus`,
      jwtVerification.verifyToken,
      questionController.addQuestionarieStatus);

    // this.router.post(`${this.path}/getaddressBookListing`,
    //   jwtVerification.verifyToken,
    //   questionController.getaddressBookListing);




  }
}

export default QuestionRoute;
