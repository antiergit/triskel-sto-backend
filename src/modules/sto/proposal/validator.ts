import { Joi } from 'express-validation';

export default class user_validator {

    static create_wallet_validate = {
        body: Joi.object({
            email: Joi.string().required(),
            wallet_name: Joi.string().required(),
            addressList: Joi.array().required(),
        })
    }
    static portfolio_validate = {
        body: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
            coin_family: Joi.array().required(),
            search: Joi.string().allow(null, '').optional(),
            addressListKeys: Joi.array().required(),
            fiat_type: Joi.string().required()
        })
    }

}