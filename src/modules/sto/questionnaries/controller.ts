import { Request, Response, raw } from "express";
import { Model, Op, Sequelize, json } from "sequelize";
import jwtHelper from "../../../helpers/common/jwt";

import response from "../../../helpers/response/response.helpers";
import { OnlyControllerInterface } from "../../../interfaces/controller.interface";
import wallethelper from "./helper";
import {
  GlblBooleanEnum,
  GlblCode,
  LoginType,
  CoinFamily,
  Fiat_Currency,
  WalletName,
} from "../../../constants/global_enum";
import { block_global_helper } from "../../../helpers/blockChainHelper/global_helper";
import http from "url";
import { language } from "../../../constants";
import commonHelper from "../../../helpers/common/common.helpers";
import * as Models from "../../../models/model/index";
import { Messages } from "./enum";
import { number } from "joi";
import { Json } from "sequelize/types/utils";
import questionhelper from "./helper";
import { Parser } from "json2csv";

class QuestionController implements OnlyControllerInterface {
  constructor() {
    this.initialize();
  }
  public initialize() {}

  public async questionsList(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      const orderBy = req.query.orderBy || "ASC";
      // let data = await Models.QuestionnModel.findAndCountAll({
      //   order: [['id', `${orderBy}`]],
      // });
      let data = await Models.QuestionnModel.findAndCountAll({
        attributes: ["id", "question", "status"],
        include: [
          {
            model: Models.QuestionOptionsModel,
            attributes: [
              ["ans_auto_id", "id"],
              ["options", "option"],
              ["skip_to", "skipTo"],
              ["categories", "category"],
            ],
            as: "answers",
            required: true,
          },
        ],
        order: [["id", `${orderBy}`]],
      });
      console.log("data list ----=====", data);
      if (data) {
        return response.success(res, {
          data: {
            message: Messages.FETCH_QUESTION,
            data,
          },
        });
      } else {
        return response.error(res, {
          data: { message: Messages.LIST_EMPTY },
        });
      }
    } catch (err) {
      console.log("data list err ----=====", err);
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }

  public async getAllcategory(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let data = await Models.QaCategoryModel.findAll();
      return response.success(res, {
        data: {
          message: Messages.CATEGORY_FOUND,
          data,
        },
      });
    } catch (err) {
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }

  public async addAnswer(req: Request, res: Response) {
    try {
      console.log("addAnswer data ", req.body.data);
      const dataArray = req.body.data;
      let user_id = req.userId;
      for await (const data of dataArray) {
        let Q: string = data.Q;
        let A: string = data.A;

        let obj: any = {
          user_id: user_id,
          question_id: Q,
          title: A,
        };
        let createData = await Models.AnswerModel.create(obj);
      }
      return response.success(res, {
        data: {
          code: GlblCode.SUCCESS,
          status: true,
          Messages: "Data saved",
        },
      });
    } catch (err: any) {
      console.error("CatchError.", err);
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: "Something went wrong",
        },
      });
    }
  }

  public async addNotEligbleUser(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let {
        proposal_id,
        question_id,
        answer,
        category,
      }: {
        user_id: number;
        proposal_id: number;
        question_id: number;
        answer: string;
        category: string;
      } = req.body;
      let user_id = req.userId;
      let obj: any = {
        user_id: user_id,
        proposal_id: proposal_id,
        question_id: question_id,
        answer: answer,
        category: category,
      };
      let createData = await Models.NotEligibleModel.create(obj);
      return response.success(res, {
        data: {
          code: GlblCode.SUCCESS,
          status: true,
          Messages: Messages.SECCUSSFULY,
        },
      });
    } catch (err: any) {
      console.error("CatchError.", err);
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }

  public async invest(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let { proposal_id }: { proposal_id: number } = req.body;
      let user_id = req.userId;
      let data = await Models.NotEligibleModel.findOne({
        where: {
          user_id: user_id,
          proposal_id: proposal_id,
          category: "Not Appropriate",
        },
      });
      let responsedata = {};
      if (data) {
        responsedata = {
          eligible_status: false,
        };
      } else {
        responsedata = {
          eligible_status: true,
        };
      }
      return response.success(res, {
        data: {
          message: Messages.DATA_FOUND,
          responsedata,
        },
      });
    } catch (err) {
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }

  public async addAddressBook(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let {
        wallet_name,
        wallet_address,
        network,
        coin_family,
        proposal_id,
        market,
      }: {
        wallet_name: string;
        wallet_address: string;
        network: string;
        coin_family: number;
        proposal_id: number;
        market: string;
      } = req.body;
      let user_id = req.userId;
      let obj: any = {
        user_id: user_id,
        wallet_name: wallet_name,
        wallet_address: wallet_address,
        network: network,
        coin_family: coin_family,
        proposal_id: proposal_id,
        market: market,
      };

      let backendWalletData: any;
      backendWalletData = await Models.BackendWalletModel.findOne({
        where: {
          wallet_address: wallet_address,
        },
        raw: true,
      });
      if (backendWalletData == null) {
        return response.error(res, {
          data: { message: Messages.WALLET_NOT_EXIST_BACKEND },
        });
      }
      let walletData: any;
      walletData = await Models.AddressBookModel.findOne({
        where: {
          wallet_address: wallet_address,
          proposal_id: proposal_id,
          user_id: user_id,
          market: market,
        },
        raw: true,
      });
      if (!walletData) {
        walletData = await Models.AddressBookModel.create(obj);
      }
      let approvedWallet = await Models.AddressBookModel.findOne({
        attributes: ["wallet_id"],
        where: {
          wallet_address: wallet_address,
          proposal_id: proposal_id,
          status: 1,
        },
        raw: true,
      });
      if (approvedWallet) {
        await Models.AddressBookModel.update(
          { status: 1 },
          {
            where: { wallet_id: walletData?.wallet_id },
          }
        );
      }
      return response.success(res, {
        data: {
          code: GlblCode.SUCCESS,
          status: true,
          message: Messages.SECCUSSFULY,
        },
      });
    } catch (err: any) {
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }

  public async getAddressBook(req: Request, res: Response) {
    try {
      let page = req.query.page || 1;
      let limit = +(req.query.limit as string) || 10;
      let offset = (+page - 1) * limit;
      let data = await Models.AddressBookModel.findAndCountAll({
        attributes: [
          "wallet_id",
          "user_id",
          "wallet_name",
          "wallet_address",
          "network",
          "proposal_id",
          "coin_family",
          "balance",
          "market",
          "status",
        ],
        where: {
          user_id: req.userId,
        },
        include: [
          {
            model: Models.ProposalModel,
            attributes: ["id", "token_name", "title"],
            required: false,
            as: "perName",
          },
        ],
        order: [["created_at", "DESC"]],
        limit,
        offset,
      });
      if (data) {
        let response = {
          message: GlblCode.SUCCESS,
          status: true,
          code: GlblCode.SUCCESS,
          data: {
            data: data.rows,
            meta: {
              page: page,
              pages: Math.ceil(data.count / limit),
              perPage: limit,
              total: data.count,
            },
          },
        };
        return res.status(response.code).send(response);
      } else {
        return response.error(res, {
          data: { message: "addressBook not Found" },
        });
      }
    } catch (err) {
      console.error("CatchError.", err);
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: "Something went wrong",
        },
      });
    }
  }

  public async getProposalWiseAddressBook(req: Request, res: Response) {
    try {
      let { proposal_id, market }: { proposal_id: number; market: string } =
        req.body;
      let page = req.body.page || 1;
      let limit = +(req.body.limit as string) || 10;
      let offset = (+page - 1) * limit;
      let data = await Models.AddressBookModel.findAndCountAll({
        attributes: [
          "wallet_id",
          "user_id",
          "wallet_name",
          "wallet_address",
          "network",
          "proposal_id",
          "coin_family",
          "balance",
          "market",
          "status",
        ],
        where: {
          user_id: req.userId,
          proposal_id: proposal_id,
          market: market,
        },
        include: [
          {
            model: Models.ProposalModel,
            attributes: ["id", "token_name", "title"],
            required: false,
            as: "perName",
          },
        ],
        order: [["created_at", "DESC"]],
        limit,
        offset,
      });
      if (data) {
        let response = {
          message: GlblCode.SUCCESS,
          status: true,
          code: GlblCode.SUCCESS,
          data: {
            data: data.rows,
            meta: {
              page: page,
              pages: Math.ceil(data.count / limit),
              perPage: limit,
              total: data.count,
            },
          },
        };
        return res.status(response.code).send(response);
      } else {
        return response.error(res, {
          data: { message: "addressBook not Found" },
        });
      }
    } catch (err) {
      console.error("CatchError.", err);
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: "Something went wrong",
        },
      });
    }
  }

  // public async getaddressBookForDropDown(req: Request, res: Response) {
  //   try {
  //     let data = await Models.AddressBookModel.findAndCountAll({
  //       order: [["created_at", "DESC"]],
  //     });
  //     if (data) {
  //       let response = {
  //         message: GlblCode.SUCCESS,
  //         status: true,
  //         code: GlblCode.SUCCESS,
  //         data: data
  //       };
  //       return res.status(response.code).send(response);
  //     } else {
  //       return response.error(res, {
  //         data: { message: "address Book For DropDown not Found" },
  //       });
  //     }
  //   } catch (err) {
  //     console.error("CatchError.", err)
  //     return response.error(res, {
  //       data: {
  //         code: GlblCode.ERROR_CODE,
  //         status: false,
  //         message: "Something went wrong"
  //       }
  //     });
  //   }
  // }

  public async getProposalName(req: Request, res: Response) {
    try {
      const data: any = await Models.WalletModel.findAll({
        attributes: ["wallet_name", "wallet_address"],
        where: {
          is_sto_wallet: 1,
          user_id: req.userId,
        },
        include: [
          {
            model: Models.ProposalModel,
            attributes: ["id", "title", "token_name", "token_address"],
            as: "ProposalData",
          },
        ],
      });
      console.log("data >>>>", data);
      if (data) {
        let response = {
          message: GlblCode.SUCCESS,
          status: true,
          code: GlblCode.SUCCESS,
          data: data,
        };
        return res.status(response.code).send(response);
      } else {
        return response.error(res, {
          data: { message: " Proposal Name not Found" },
        });
      }
    } catch (err) {
      console.error("CatchError.", err);
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: "Something went wrong",
        },
      });
    }
  }
  public async addQuestionarieStatus(req: Request, res: Response) {
    try {
      let user_id: number = req.userId;
      let status: number = req.body.status;
      if (!status) {
        let find_status = await Models.QaCategoryModelStatus.findOne({
          where: {
            user_id: user_id,
            status: 1,
          },
        });
        if (!find_status) {
          return response.success(res, {
            data: {
              code: GlblCode.SUCCESS,
              status: false,
              Messages: "Status Not Exist",
            },
          });
        } else {
          return response.success(res, {
            data: {
              code: GlblCode.SUCCESS,
              status: true,
              Messages: "Status Exist",
            },
          });
        }
      } else {
        let obj = {
          user_id: user_id,
          status: status,
        };
        let data = await Models.QaCategoryModelStatus.create(obj);
        if (data) {
          return response.success(res, {
            data: {
              code: GlblCode.SUCCESS,
              status: true,
              Messages: "Status updated",
            },
          });
        }
      }
    } catch (err) {
      console.error("CatchError.", err);
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: "Something went wrong",
        },
      });
    }
  }
  public async getAllProposalName(req: Request, res: Response) {
    try {
      const data: any = await Models.ProposalModel.findAll({
        attributes: ["id", "title", "token_name", "token_address"],
      });
      console.log("data >>>>", data);
      if (data) {
        let response = {
          message: GlblCode.SUCCESS,
          status: true,
          code: GlblCode.SUCCESS,
          data: data,
        };
        return res.status(response.code).send(response);
      } else {
        return response.error(res, {
          data: { message: " Proposal Name not Found" },
        });
      }
    } catch (err) {
      console.error("CatchError.", err);
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: "Something went wrong",
        },
      });
    }
  }
}
export const questionController = new QuestionController();
