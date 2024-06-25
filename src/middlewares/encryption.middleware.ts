import { Request, Response, NextFunction } from "express";
import response from "../helpers/response/response.helpers";
import commonHelper from "../helpers/common/common.helpers";
import { config } from "../config/config";
import { GlblMessages } from "../constants/global_enum";
import { language } from "../constants";

export const encryptionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  let lang: any = req.headers['content-language'] || 'en';
  try {
    // console.log("Entered into src > middlewares > encryption.middleware.ts > encryptionMiddleware.ts")
    const method = req.method;
    console.log("\n\n🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀\n");
    console.log("req.originalUrl", method, "~~~", req.originalUrl);
    // console.log("HEADER ip   ", req.ip);
    // console.log("HEADER authorization >>>   ", req.headers.authorization);
    // console.log("dataString:   ", req?.body?.dataString);

    if ((req.body && method == "PUT" || method == "PATCH" || method == "POST" || method == "GET")) {
      next();
    }
    // if ((req.body.dataString && method == "PUT" || method == "PATCH" || method == "POST")) {
    //   if (req.body.dataString) {
    //     let dataFields: any;
    //     if (req.originalUrl.includes('admin')) {
    //       dataFields = await commonHelper.adminDecryptDataRSA(req.body.dataString)
    //     } else {
    //       dataFields = await commonHelper.decryptDataRSA(req.body.dataString);
    //     }
    //     if (dataFields) {
    //       dataFields = JSON.parse(dataFields);
    //       req.body = dataFields;
    //       next();
    //     } else {
    //       return response.error(res, {
    //         data: {
    //           message: language[lang].CATCH_MSG
    //         }
    //       })
    //     }
    //   } else if (!req.body.dataString && (req.originalUrl == `/api/v1/on_off_ramp/add_transact_fiats` ||
    //     req.originalUrl == `/api/v1/on_off_ramp/add_alchemy_fiats` ||
    //     req.originalUrl == `/api/v1/on_off_ramp/fiat_list` ||
    //     req.originalUrl == `/api/v1/on_off_ramp/transak_webhook` ||
    //     req.originalUrl == `/api/v1/on_off_ramp/alchemy_webhook` ||
    //     req.originalUrl == `/api/v1/alchemy/alchemy_webhook` ||
    //     req.originalUrl == `/api/v1/card/binding_kyc` ||
    //     req.originalUrl == `/api/v1/card/unbinding` ||
    //     req.originalUrl == `/api/v1/card/checkResult` ||
    //     req.originalUrl == `/api/v1/wallet/fee` ||
    //     req.originalUrl == `/api/v1/card/hc_sync/common` ||
    //     req.originalUrl == `/api/v1/card/liminal_webhook` ||
    //     req.originalUrl == `/api/v1/card/upload_kyc_details` ||
    //     req.originalUrl == `/api/v1/card/kyc_details` ||
    //     req.originalUrl == `/api/v1/card/testing_of_physical_upload_kyc` ||
    //     req.originalUrl == `/api/v1/wallet/order/update` ||
    //     req.originalUrl == `/api/v1/wallet/activeinactive` ||
    //     req.originalUrl == `/api/v1/wallet/getFiatPrice` ||
    //     req.originalUrl == `/api/v1/wallet/updateBalance` ||
    //     req.originalUrl == `/api/v1/wallet/coin/details` ||
    //     req.originalUrl == `/api/v1/user/file_upload` ||
    //     req.originalUrl == `/api/v1/referral/sign_contract` ||
    //     req.originalUrl == `/api/v1/wallet/nativeCoinFiatPrice`)) {
    //     console.log("get into special hooks i.e Webhook")
    //     next();
    //   } else {
    //     console.log("To remove this else condition ")
    //     next();
    //     // return response.error(res, {
    //     //   data: {
    //     //     message: language[lang].CATCH_MSG
    //     //   }
    //     // })
    //   }
    // } else if (method == "GET") {
    //   next();
    // } else {
    //   console.log("Entered into LAST ELSE condition")
    //   return response.error(res, {
    //     data: {
    //       message: language[lang].CATCH_MSG
    //     }
    //   })
    // }
  } catch (err: any) {
    console.error("\n\n error >", err);
    return response.error(res, {
      data: {
        message: language[lang].CATCH_MSG
      }
    });
  }
}
