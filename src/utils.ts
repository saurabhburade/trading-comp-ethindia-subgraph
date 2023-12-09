import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { BI_18, ONE_BI, ZERO_BI } from "./../helpers/constants";

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString("1");
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString("10"));
  }
  return bd;
}

export function priceDivideDecimals(
  tokenInDecimals: BigInt,
  tokenOutDecimals: BigInt
): BigDecimal {
  const decimals = BI_18.minus(tokenInDecimals.minus(tokenOutDecimals));
  let bd = BigDecimal.fromString("1");
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString("10"));
  }
  return bd;
}
