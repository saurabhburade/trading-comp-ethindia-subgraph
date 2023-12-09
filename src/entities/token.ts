import { ERC20 } from './../../generated/templates/TradingComp/ERC20';
import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { Token } from "../../generated/schema";
import { ONE_BI, ZERO_BD, ZERO_BI } from '../../helpers/constants';
import { exponentToBigDecimal } from '../utils';

export function saveToken(
  tokenAddress: Address,
  amount: BigInt,

  event: ethereum.Event
): Token {
  let token = Token.load(tokenAddress.toHexString());
  if (token === null) {
    log.info("TOKEN--NOT--FOUND", []);
    log.info("CREATING NEW TOKEN", []);
    token = new Token(tokenAddress.toHexString());
    const tokenContract = ERC20.bind(tokenAddress);
    token.name = tokenContract.name();
    token.symbol = tokenContract.symbol();
    token.decimals = BigInt.fromI32(tokenContract.decimals());
    token.totalSupply = tokenContract.totalSupply();

    token.tradeVolumeTokens = ZERO_BD;
    token.txCount = ZERO_BI;

  }
  log.info("TOKEN FOUND :: {}", [token.symbol]);




  token.tradeVolumeTokens = token.tradeVolumeTokens.plus(
    amount.toBigDecimal().div(exponentToBigDecimal(token.decimals))
  );

  token.txCount = token.txCount.plus(ONE_BI);

  token.save();
  return token;
}
