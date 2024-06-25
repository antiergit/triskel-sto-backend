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
import agenthelper from "./helper";
import { transactionStatus } from "./enum";
import { Parser } from 'json2csv';


class AgentController implements OnlyControllerInterface {
  constructor() {
    this.initialize();
  }
  public initialize() { }

  public async proposalList(req: Request, res: Response) {
    try {
      let page = req.query.page || 1;
      let limit = +(req.query.limit as string) || 10;
      let offset = (+page - 1) * limit;
      let final_data: any = await agenthelper.agent_proposal_data(
        limit,
        offset
      );
      if (final_data) {
        return response.success(res, {
          data: {
            message: Messages.DATA_FOUND,
            data: {
              data: final_data,
              meta: {
                page: Number(page),
                pages: Math.ceil(final_data.count / limit),
                perPage: limit,
                total: final_data.count,
              },
            },
          },
        });
      } else {
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND, data: [] },
        });
      }
    } catch (err) {
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: Messages.SOMETHING_WRONG,
        },
      });
    }
  }
  public async invested_users_particular_proposal(req: Request, res: Response) {
    try {
      let proposal_id: number = req.body.proposal_id;

      let page = req.query.page || 1;
      let limit = +(req.query.limit as string) || 10;
      let offset = (+page - 1) * limit;
      let condition: any;
      let final_data: any = await agenthelper.view_particular_proposal_data(
        proposal_id,
        limit,
        offset
      );
      if (!final_data) {
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND, data: [] },
        });
      } else {
        return response.success(res, {
          data: {
            message: Messages.DATA_FOUND,
            data: {
              data: final_data,
              meta: {
                page: Number(page),
                pages: Math.ceil(final_data.count / limit),
                perPage: limit,
                total: final_data.count,
              },
            },
          },
        });
      }
    } catch (err) {
      console.log("rrrr", err);
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: Messages.SOMETHING_WRONG,
        },
      });
    }
  }

  public async mint_invested_particular_proposal(req: Request, res: Response) {
    try {
      let proposal_id: number = req.body.proposal_id;

      let page = req.query.page || 1;
      let limit = +(req.query.limit as string) || 10;
      let offset = (+page - 1) * limit;
      let condition: any;
      let final_data: any =
        await agenthelper.view_particular_proposal_data_for_minting(
          proposal_id,
          limit,
          offset
        );
      if (!final_data) {
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND, data: [] },
        });
      } else {
        return response.success(res, {
          data: {
            message: Messages.DATA_FOUND,
            data: {
              data: final_data,
              meta: {
                page: Number(page),
                pages: Math.ceil(final_data?.no_of_users_invested / limit),
                perPage: limit,
                total: final_data?.no_of_users_invested,
              },
            },
          },
        });
      }
    } catch (err) {
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: Messages.SOMETHING_WRONG,
        },
      });
    }
  }
  public async update_aprrove_proposal(req: Request, res: Response) {
    try {
      let lang: any = req.headers["content-language"] || "en";
      let {
        proposal_id,
        approval_status,
        wallet_address,
      }: {
        proposal_id: number;
        approval_status: string;
        wallet_address: string;
      } = req.body;
      console.log("---=====", proposal_id, approval_status, wallet_address);

      for await (const wallet of wallet_address) {
        console.log("---=====", wallet);

        const data = await Models.WalletModel.update(
          {
            approval_status: approval_status,
          },
          {
            where: {
              proposal_id: proposal_id,
              wallet_address: wallet,
            },
          }
        );
        if (data) {
          let response = {
            message: GlblCode.SUCCESS,
            status: true,
            code: GlblCode.SUCCESS,
            data: data,
          };
          return res.status(response.code).send(response);
        } else {
          return response.error(res, { data: { message: "Data not Added" } });
        }
      }
    } catch (err) {
      return response.error(res, { data: { message: "Something went wrong" } });
    }
  }
  // public async update_approval_for_mint(req: Request, res: Response) {
  //   try {
  //     let {
  //       proposal_id,
  //       wallet_address,
  //       user_token_quantity,
  //       transaction_id,
  //     }: {
  //       proposal_id: number;
  //       wallet_address: string;
  //       user_token_quantity: number;
  //       transaction_id: number;
  //     } = req.body;
  //     // let { addressList }: { addressList: any } = req.body
  //     console.log("req.body@@@@@@@", req.body);
  //     console.log("wallet of cxxcxc sto  update wallet >>>", proposal_id);

  //     let updateData = await Models.WalletModel.update(
  //       {
  //         balance: user_token_quantity,
  //       },
  //       {
  //         where: {
  //           proposal_id: proposal_id,
  //           wallet_address: wallet_address,
  //         },
  //       }
  //     );
  //     console.log("updateData@@@", updateData);
  //     let updateTrxData = await Models.TransactionsModel.update(
  //       { token_mint_status: "complete" },
  //       {
  //         where: {
  //           proposal_id: proposal_id,
  //           user_adrs: wallet_address,
  //           id: transaction_id,
  //         },
  //       }
  //     );
  //     let response = {
  //       message: GlblCode.SUCCESS,
  //       status: true,
  //       code: GlblCode.SUCCESS,
  //       data: updateTrxData,
  //     };
  //     return res.status(response.code).send(response);
  //     // }
  //   } catch (err) {
  //     console.log("catch error@@@@@@", err);
  //     return response.error(res, {
  //       data: {
  //         code: GlblCode.ERROR_CODE,
  //         status: false,
  //         message: Messages.SOMETHING_WRONG,
  //       },
  //     });
  //   }
  // }
  public async update_approval_for_mint(req: Request, res: Response) {
    try {
      let { addressList }: { addressList: any } = req.body;
      console.log("req.body@@@@@@@", req.body);

      for await (const wallet of addressList) {
        await agenthelper.adding_sto_trnx_to_queue({
          proposal_id: wallet?.proposal_id,
          wallet_address: wallet?.wallet_address,
          user_token_quantity: wallet?.user_token_quantity,
          transaction_id: wallet?.transaction_id,
          token_address: wallet?.token_address,
          mint_tx_hash: wallet?.tx_hash,
          qa_status: 0
        });
        const updateData = await Models.TransactionsModel.update(
          {
            qa_status: 0,
          },
          {
            where: {
              id: wallet?.transaction_id,
            },
          }
        );
      }
      let response = {
        message: GlblCode.SUCCESS,
        status: true,
        code: GlblCode.SUCCESS,
      };
      return res.status(response.code).send(response);
    } catch (err) {
      console.log("catch error@@@@@@", err);
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: Messages.SOMETHING_WRONG,
        },
      });
    }
  }


  public async mint_invested_admin_download_csv(req: Request, res: Response) {
    try {
      let proposal_id: any = req.query.proposal_id;

      let final_data: any =
        await agenthelper.view_particular_proposal_data_for_minting_for_dwnld_csv(
          proposal_id
        );
      let ary: any = [];
      let serial_number: number = 0;
      for (let i: number = 0; i < final_data.length; i++) {
        serial_number = serial_number + 1;
        let user_name: any = null;
        let email: any = null;
        let wallet_address: any = null;
        let approval_status: any = null;

        if (final_data[i].wallet_data.dataValues) {
          user_name = final_data[i].wallet_data.dataValues.username;
          email = final_data[i].wallet_data.dataValues.email;
          wallet_address = final_data[i].wallet_data.dataValues.wallet_address;
          approval_status = final_data[i].wallet_data.dataValues.approval_status
        }

        ary.push({
          serial_number: serial_number,
          // user_id: final_data[i].user_id,
          // user_token_quantity: final_data[i].user_token_quantity,
          // status: final_data[i].status,
          // blockchain_status: final_data[i].blockchain_status,
          // refund_status: final_data[i].refund_status || 0,
          // user_adrs: final_data[i].user_adrs,
          // qa_status: final_data[i].qa_status,
          // soft_cap_status: final_data[i].dataValues.soft_cap_status,
          // hard_cap_status: final_data[i].dataValues.hard_cap_status,
          // proposal_id: proposal_id,
          amount: final_data[i].amount,
          user_name: user_name,
          email: email,
          wallet_address: wallet_address,
          token_mint_status: final_data[i].token_mint_status

        })
        console.log("arrray ---->>> ", ary)

      }

      const opts = {
        fields: [
          { label: 'S.No.', value: 'serial_number' },
          // { label: 'User Id', value: 'user_id' },
          // { label: 'Token Quantity', value: 'user_token_quantity' },
          // { label: 'Status', value: 'status' },
          // { label: 'Blockchain Status', value: 'blockchain_status' },
          // { label: 'Refund Status', value: 'refund_status' },
          // { label: 'User Address', value: 'user_adrs' },
          // { label: 'QA Status', value: 'qa_status' },
          // { label: 'Token Mint Status', value: 'token_mint_status' },
          // { label: 'Soft Cap Status', value: 'soft_cap_status' },
          // { label: 'Hard Cap Status', value: 'hard_cap_status' },
          // { label: 'Proposal Id', value: 'proposal_id' },
          { label: 'User Name', value: 'user_name' },
          { label: 'Email', value: 'email' },
          { label: 'User Address', value: 'wallet_address' },
          { label: 'Amount', value: 'amount' },
          { label: 'Action', value: 'token_mint_status' },
        ]
      };

      const parser = new Parser(opts);
      const uniqueFileName: string = `minting.csv`
      const csvData = parser.parse(ary);

      res.setHeader(
        "Content-Disposition",
        "attachment; filename= mint_invested.csv"
      );
      res.setHeader("Content-Type", "text/csv");
      return res.status(200).send(csvData);

    } catch (err) {
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: Messages.SOMETHING_WRONG,
        },
      });
    }
  }

  public async invested_particular_proposal_download_csv(req: Request, res: Response) {
    try {
      let proposal_id: any = req.query.proposal_id;
      let final_data: any = await agenthelper.view_particular_proposal_data_dwld_csv(
        proposal_id
      );

      let ary: any = [];
      let serial_number: number = 0;
      for (let i: number = 0; i < final_data.length; i++) {
        serial_number = serial_number + 1;
        let user_name: any = null;
        let email: any = null;
        let wallet_address: any = null;
        let approval_status: any = null;

        if (final_data[i].wallet_data.dataValues) {
          user_name = final_data[i].wallet_data.dataValues.username;
          email = final_data[i].wallet_data.dataValues.email;
          wallet_address = final_data[i].wallet_data.dataValues.wallet_address;
          approval_status = final_data[i].wallet_data.dataValues.approval_status === null ? 'Pending' : final_data[i].wallet_data.dataValues.approval_status === 0 ? 'Decline' : 'Approved'
        }
        ary.push({
          serial_number: serial_number,
          user_id: final_data[i].user_id,
          amount: final_data[i].amount,
          status: final_data[i].status,
          user_adrs: final_data[i].user_adrs,
          soft_cap_status: final_data[i].dataValues.soft_cap_status,
          hard_cap_status: final_data[i].dataValues.hard_cap_status,
          proposal_id: proposal_id,
          user_name: user_name,
          email: email,
          wallet_address: wallet_address,
          approval_status: approval_status
        })
        // console.log("arrray ---->>> ", ary)

      }

      const opts = {
        fields: [
          { label: 'S.No.', value: 'serial_number' },
          // { label: 'User Id', value: 'user_id' },
          // { label: 'Status', value: 'status' },
          // { label: 'User Address', value: 'user_adrs' },
          // { label: 'Soft Cap Status', value: 'soft_cap_status' },
          // { label: 'Hard Cap Status', value: 'hard_cap_status' },
          // { label: 'Proposal Id', value: 'proposal_id' },
          { label: 'User Name', value: 'user_name' },
          { label: 'Email', value: 'email' },
          { label: 'User Address', value: 'wallet_address' },
          { label: 'Action', value: 'approval_status' },

        ]
      };

      const parser = new Parser(opts);
      const uniqueFileName: string = `invested_particular.csv`
      const csvData = parser.parse(ary);

      res.setHeader(
        "Content-Disposition",
        "attachment; filename= invested_particular_proposal.csv"
      );
      res.setHeader("Content-Type", "text/csv");
      return res.status(200).send(csvData);


    } catch (err) {
      console.log("rrrr", err);
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: Messages.SOMETHING_WRONG,
        },
      });
    }
  }

  //------------secondary admin apis--------------------

  public async secondaryProposalData(req: Request, res: Response) {
    try {
      let page = req.query.page || 1;
      let limit = +(req.query.limit as string) || 10;
      let offset = (+page - 1) * limit;
      let final_data: any = await agenthelper.secondaryProposalData(
        limit,
        offset
      );
      if (final_data) {
        return response.success(res, {
          data: {
            message: Messages.DATA_FOUND,
            data: {
              data: final_data,
              meta: {
                page: Number(page),
                pages: Math.ceil(final_data.count / limit),
                perPage: limit,
                total: final_data.count,
              },
            },
          },
        });
      } else {
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND, data: [] },
        });
      }
    } catch (err) {
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: Messages.SOMETHING_WRONG,
        },
      });
    }
  }

  public async secondaryPoposalsOfProposalData(req: Request, res: Response) {
    try {
      let proposal_id:any = req.body.proposal_id || 1;
      let page = req.query.page || 1;
      let limit = +(req.query.limit as string) || 10;
      let offset = (+page - 1) * limit;
      let final_data: any = await agenthelper.getSeconadryList(
        proposal_id,
        limit,
        offset
      );
      if (final_data) {
        return response.success(res, {
          data: {
            message: Messages.DATA_FOUND,
            data: {
              data: final_data,
              meta: {
                page: Number(page),
                pages: Math.ceil(final_data.count / limit),
                perPage: limit,
                total: final_data.count,
              },
            },
          },
        });
      } else {
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND, data: [] },
        });
      }
    } catch (err) {
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: Messages.SOMETHING_WRONG,
        },
      });
    }
  }

  public async secondaryMarketTransactionData(req: Request, res: Response) {
    try {
      let page = req.query.page || 1;
      let limit = +(req.query.limit as string) || 10;
      let offset = (+page - 1) * limit;
      let final_data: any = await agenthelper.getSeconadryMarketData(
        limit,
        offset
      );
      if (final_data) {
        return response.success(res, {
          data: {
            message: Messages.DATA_FOUND,
            data: {
              data: final_data,
              meta: {
                page: Number(page),
                pages: Math.ceil(final_data.count / limit),
                perPage: limit,
                total: final_data.count,
              },
            },
          },
        });
      } else {
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND, data: [] },
        });
      }
    } catch (err) {
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: Messages.SOMETHING_WRONG,
        },
      });
    }
  }
}
export const agentController = new AgentController();
