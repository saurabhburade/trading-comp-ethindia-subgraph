import { Address, dataSource, log } from "@graphprotocol/graph-ts";
import {
  Burn,
  Mint,
  Swap,
  Sync,
  Transfer,
  UniswapPair,
} from "../../generated/templates/TradingComp/UniswapPair";
import {
  ONE_BI,
  UNISWAP_PAIR_CONTEXT_KEY,
  ZERO_BD,
  ZERO_BI,
} from "../../helpers/constants";
import {
  Pair,
  Token,
  TradingCompetiton,
  User,
  UserParticipatedTradingCompetiton,
} from "../../generated/schema";
import { saveToken } from "../entities/token";
import { exponentToBigDecimal } from "../utils";

export function handleMint(event: Mint): void {}
export function handleBurn(event: Burn): void {}
export function handleSwap(event: Swap): void {
  let context = dataSource.context();
  let tradingCompAddress = context.getString(UNISWAP_PAIR_CONTEXT_KEY);
  log.info("TRADING VOLUME COUNT IN CONTEXT ::: {}", [tradingCompAddress]);
  const userComp = UserParticipatedTradingCompetiton.load(
    event.transaction.from
      .toHexString()
      .concat("_")
      .concat(tradingCompAddress)
  );


  log.info("PARTICIPATED TRADE :::: {}", [
    event.transaction.from
      .toHexString()
      .concat("_")
      .concat(tradingCompAddress),
  ]);
  if (userComp !== null) {
    log.info("SWAPPPPPP  :: Key ={}", [UNISWAP_PAIR_CONTEXT_KEY]);

    let tradingComp = TradingCompetiton.load(tradingCompAddress);
    if (tradingComp === null) {
      tradingComp = new TradingCompetiton(tradingCompAddress);
      tradingComp.totalParticipants = ZERO_BI;
      tradingComp.totalTxns = ZERO_BI;
      tradingComp.totalBuyTxnsToken0 = ZERO_BI;
      tradingComp.totalBuyTxnsToken1 = ZERO_BI;
      tradingComp.totalVolumeInToken0 = ZERO_BD;
      tradingComp.totalVolumeInToken1 = ZERO_BD;
      tradingComp.startTime = ZERO_BI;
      tradingComp.endTime = ZERO_BI;
      tradingComp.regTime = ZERO_BI;
      tradingComp.pairs = [];
    }
    tradingComp.totalTxns = tradingComp.totalTxns.plus(ONE_BI);
    tradingComp.save();
    let pair = Pair.load(event.address.toHexString());
    if (pair === null) {
      pair = new Pair(event.address.toHexString());
      pair.reserve0 = ZERO_BD;
      pair.reserve1 = ZERO_BD;
      pair.totalSupply = ZERO_BD;
      pair.volumeToken0 = ZERO_BD;
      pair.volumeToken1 = ZERO_BD;
      pair.txCount = ZERO_BI;
    }
    let token0: Token | null = null;
    let token1: Token | null = null;
    if (tradingComp.token0 !== null) {
      token0 = Token.load(tradingComp.token0 as string);
      pair.token0 = tradingComp.token0;
    }
    if (tradingComp.token1 !== null) {
      token1 = Token.load(tradingComp.token1 as string);
      pair.token1 = tradingComp.token1;
    }
    const pairContract = UniswapPair.bind(event.address);
    if (pairContract !== null) {
      const token0Address = (pairContract as UniswapPair).try_token0();
      log.info("token0Address :::: {}", [token0Address.value.toHexString()]);
      const token1Address = (pairContract as UniswapPair).try_token1();
      log.info("token0Address :::: {}", [token1Address.value.toHexString()]);
      if (!token0Address.reverted) {
        if (tradingComp.token0 === null) {
          token0 = saveToken(
            Address.fromString(token0Address.value.toHexString()),
            ZERO_BI,
            event
          );
          tradingComp.token0 = token0Address.value.toHexString();
          pair.token0 = token0Address.value.toHexString();
        }
      }
      if (!token1Address.reverted) {
        if (tradingComp.token1 === null) {
          token1 = saveToken(
            Address.fromString(token1Address.value.toHexString()),
            ZERO_BI,
            event
          );
          tradingComp.token1 = token1Address.value.toHexString();
          pair.token1 = token1Address.value.toHexString();
        }
      }
      log.info("TOKEN0 SYMBOL ::: {}", [(token0 as Token).symbol || "NA"]);
      log.info("TOKEN1 SYMBOL :::{}", [(token1 as Token).symbol || "NA"]);

      const reserves_try = (pairContract as UniswapPair).try_getReserves();
      if (token0 !== null && token1 !== null) {
        if (event.params.amount0In <= ZERO_BI) {
          tradingComp.totalVolumeInToken0 = tradingComp.totalVolumeInToken0.plus(
            event.params.amount0Out
              .toBigDecimal()
              .div(exponentToBigDecimal(token0.decimals))
          );

          userComp.totalVolumeInToken0 = userComp.totalVolumeInToken0.plus(
            event.params.amount0Out
              .toBigDecimal()
              .div(exponentToBigDecimal(token0.decimals))
          );
          tradingComp.totalVolumeInToken1 = tradingComp.totalVolumeInToken1.plus(
            event.params.amount1In
              .toBigDecimal()
              .div(exponentToBigDecimal((token1 as Token).decimals))
          );
          userComp.totalVolumeInToken1 = userComp.totalVolumeInToken1.plus(
            event.params.amount1In
              .toBigDecimal()
              .div(exponentToBigDecimal(token1.decimals))
          );
          userComp.totalBuyTxnsToken0 = userComp.totalBuyTxnsToken0.plus(
            ONE_BI
          );
          tradingComp.totalBuyTxnsToken0 = tradingComp.totalBuyTxnsToken0.plus(
            ONE_BI
          );
        }
        if (event.params.amount1In <= ZERO_BI) {
          tradingComp.totalVolumeInToken1 = tradingComp.totalVolumeInToken1.plus(
            event.params.amount1Out
              .toBigDecimal()
              .div(exponentToBigDecimal((token1 as Token).decimals))
          );
          userComp.totalVolumeInToken1 = userComp.totalVolumeInToken1.plus(
            event.params.amount1Out
              .toBigDecimal()
              .div(exponentToBigDecimal((token1 as Token).decimals))
          );
          tradingComp.totalVolumeInToken0 = tradingComp.totalVolumeInToken0.plus(
            event.params.amount0In
              .toBigDecimal()
              .div(exponentToBigDecimal(token0.decimals))
          );
          userComp.totalVolumeInToken0 = userComp.totalVolumeInToken0.plus(
            event.params.amount0In
              .toBigDecimal()
              .div(exponentToBigDecimal(token0.decimals))
          );
          tradingComp.totalBuyTxnsToken1 = tradingComp.totalBuyTxnsToken1.plus(
            ONE_BI
          );
          userComp.totalBuyTxnsToken1 = userComp.totalBuyTxnsToken1.plus(
            ONE_BI
          );
        }
        if (
          event.params.amount0In <= ZERO_BI &&
          event.params.amount1Out <= ZERO_BI
        ) {
          tradingComp.totalVolumeInToken1 = tradingComp.totalVolumeInToken1.plus(
            event.params.amount1In
              .toBigDecimal()
              .div(exponentToBigDecimal((token1 as Token).decimals))
          );
          userComp.totalVolumeInToken1 = userComp.totalVolumeInToken1.plus(
            event.params.amount1In
              .toBigDecimal()
              .div(exponentToBigDecimal((token1 as Token).decimals))
          );
          tradingComp.totalVolumeInToken0 = tradingComp.totalVolumeInToken0.plus(
            event.params.amount0Out
              .toBigDecimal()
              .div(exponentToBigDecimal(token0.decimals))
          );
          userComp.totalVolumeInToken0 = userComp.totalVolumeInToken0.plus(
            event.params.amount0Out
              .toBigDecimal()
              .div(exponentToBigDecimal(token0.decimals))
          );
          tradingComp.totalBuyTxnsToken0 = tradingComp.totalBuyTxnsToken0.plus(
            ONE_BI
          );
          userComp.totalBuyTxnsToken0 = userComp.totalBuyTxnsToken0.plus(
            ONE_BI
          );
        }
      }
      if (!reserves_try.reverted) {
        const reserves = reserves_try.value;
        pair.reserve0 = reserves.get_reserve0().toBigDecimal();
        pair.reserve1 = reserves.get_reserve1().toBigDecimal();
      }
      const user = User.load(event.transaction.from.toHexString());
      let tempComps = (user as User).competitions;
      if (tempComps !== null) {
        tempComps = [];
        tempComps.push(userComp.id);
      }
      (user as User).competitions = tempComps;
      tradingComp.pairs = [pair.id];
      pair.save();
      tradingComp.save();
    }
  }
}
export function handleTransfer(event: Transfer): void {}
export function handleSync(event: Sync): void {}
