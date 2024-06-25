export enum Messages {
  ALREADY_EXIST = 'user already exist.',
  SUCCESS = 'success.',
  SECCUSSFULY = 'added seccussfuly.',
  ORDER_CANCELED = 'Order cancelled seccussfuly.',
  UPDATED = 'updated successfully.',
  GET_COIN_LIST = 'get all coins list',
  NOT_FOUND = 'user not found',
  Data_FOUND = 'Data found',
  Data_NOT_FOUND = 'Data not found',
  UNABALE_TO_PROCEED = 'Unable to proceed!',
  INVAILID_TOKEN_QTY = "Invailid token quantity!",
  TOKEN_NOT_ENOUGH = "TOKEN_NOT_ENOUGH!",

  INVAILID_AMOUNT = "Invailid amount!",
  ORDER_CREATE = "Order created successfully!",
  ADDRESS_DOES_NOT_EXIST = 'Invalid Wallet Address.',
  TRANSACTION_SUCCESS = "Transaction Successfull",
  BALANCE_UPDATED = "Balance updated successfully.",
  INSUFFICIENT_BALANCE = "User has insufficient balance",
  BALANCE_MINUS = "Balance is in minus",
  PROPOSAL_NOT_FOUND = "Proposals not found",
  INVALID_TOKEN_QUANTITY = "Token quantity is not valid.",
  CREATE_KYC = "Create Kyc Successfully."


}

export const order = {
  STATUS_SUCCESS: "Data fetch Successfully.",
  OREDRID_FAIL: "OrderId Not Exist.",
  ERROR: "Something Went Wrong.",
  ORDER_NOT_EXISTS: "order not exists."
};

export enum PROPOSAL_STATUS {
  Open = "0",
  Upcoming = "1",
  Closed = "2",
}
export enum ProposalCategoryStatus {
  ACTIVE = 1,
  INACTIVE = 0,
  OBSOLETE = 2
}

export enum TUT_COIN_ID {
  coin_id = 8,
}
export enum COIN_FAMILY {
  polygon = 4,
}


export enum mintStatus {
  unMinted,
  minted,
  sent_minted_token,
  refunded,
}
export enum orderStatus {
  PENDING = "pending",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  IN_PROGRESS = "in_progress"
}
export enum transactionStatus {
  STATUS_COMPLETE = "complete",
  blockchain_status_FAILED = "FAILED",
  CONFIRMED = "CONFIRMED",
  PENDING = "PENDING",
  TOKEN_MINT_STATUS_COMPLETE = "complete"

}
export enum orderTokensBlocked {
  unblocked,
  blocked
}

export enum PaymentCheckoutEventStatus {
  cancel,
  success
}

export enum relistedStatus {
  notListed,
  listed,
}

export enum orderLogActions {
  PROCEED_TO_PAY = "proceed_to_pay",
  TIMEOUT = "timeout",
  PENDING = "pending",
  CANCEL = "cancel",
  COMPLETED = "completed",
  IN_PROGRESS = "in_progress",
  SUCCESS_EVENT = "success_event"
}

export enum orderBuyingType {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw"
}

export enum tokenMintStatus {
  PENDING = "pending",
  COMPLETE = "complete"
}

export enum coinSymbol {
  POLYGON = "matic"
}




