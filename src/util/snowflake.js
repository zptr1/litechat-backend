import { Snowflake } from "nodejs-snowflake";

// First second of 2023
export const LITECHAT_EPOCH = 1672531200000;

export const uid = new Snowflake({
  custom_epoch: LITECHAT_EPOCH
});
