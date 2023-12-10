import {
  NewEndTime,
  NewRegTime,
  NewStartTime,
  RemovePair,
} from "./../../generated/TradingCompFactory/TradingComp";
import { Address, DataSourceContext, log } from "@graphprotocol/graph-ts";

import {
  Pair,
  TradingCompetiton,
  User,
  UserParticipatedTradingCompetiton,
} from "../../generated/schema";
import {
  NewPairSet,
  OwnershipTransferred,
  Register,
} from "./../../generated/templates/TradingComp/TradingComp";
import { UniswapPair } from "./../../generated/templates/TradingComp/UniswapPair";
import {
  ONE_BI,
  UNISWAP_PAIR_CONTEXT_KEY,
  ZERO_BD,
  ZERO_BI,
} from "../../helpers/constants";
import { UniswapPair as PairTemplate } from "../../generated/templates";
import { saveToken } from "../entities/token";
export function handleNewPairSet(event: NewPairSet): void {
  log.info("handleNewPairSet {} ", [event.params._pair.toHexString()]);
  let tradingComp = TradingCompetiton.load(event.address.toHexString());
  if (tradingComp === null) {
    tradingComp = new TradingCompetiton(event.address.toHexString());
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
  log.info("CREATING PAIR LISTNER ", []);
  let context = new DataSourceContext();
  context.setString(UNISWAP_PAIR_CONTEXT_KEY, event.address.toHexString());
  PairTemplate.createWithContext(event.params._pair, context);
  let pair = Pair.load(event.params._pair.toHexString());
  if (pair === null) {
    pair = new Pair(event.params._pair.toHexString());
    pair.reserve0 = ZERO_BD;
    pair.reserve1 = ZERO_BD;
    pair.totalSupply = ZERO_BD;
    pair.volumeToken0 = ZERO_BD;
    pair.volumeToken1 = ZERO_BD;
    pair.txCount = ZERO_BI;
  }

  const pairContract = UniswapPair.bind(event.params._pair);
  if (pairContract !== null) {
    const token0Address = (pairContract as UniswapPair).try_token0();
    log.info("token0Address :::: {}", [token0Address.value.toHexString()]);
    const token1Address = (pairContract as UniswapPair).try_token1();
    log.info("token0Address :::: {}", [token1Address.value.toHexString()]);
    if (!token0Address.reverted) {
      if (tradingComp.token0 === null) {
        saveToken(
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
        saveToken(
          Address.fromString(token1Address.value.toHexString()),
          ZERO_BI,
          event
        );
        tradingComp.token1 = token1Address.value.toHexString();
        pair.token1 = token1Address.value.toHexString();
      }
    }

    const reserves_try = (pairContract as UniswapPair).try_getReserves();

    if (!reserves_try.reverted) {
      const reserves = reserves_try.value;
      pair.reserve0 = reserves.get_reserve0().toBigDecimal();
      pair.reserve1 = reserves.get_reserve1().toBigDecimal();
    }

    tradingComp.pairs = [pair.id];
    pair.save();
  }
  // let parsedPairs = tradingComp.pairs;
  // if (parsedPairs !== null) {
  //   // const uniquePairsSet = parsedPairs
  //   // parsedPairs = uniquePairsSet;
  //   if (parsedPairs !== null) {
  //     parsedPairs.push(event.params._pair.toString());
  //   }
  //   tradingComp.pairs = parsedPairs;
  // }

  tradingComp.save();
}
export function handleOwnershipTransferred(event: OwnershipTransferred): void {}
export function handleNewEndTime(event: NewEndTime): void {
  let tradingComp = TradingCompetiton.load(event.address.toHexString());
  if (tradingComp === null) {
    tradingComp = new TradingCompetiton(event.address.toHexString());
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

  tradingComp.endTime = event.params._endTime;
  tradingComp.save();
}
export function handleNewRegTime(event: NewRegTime): void {
  let tradingComp = TradingCompetiton.load(event.address.toHexString());
  if (tradingComp === null) {
    tradingComp = new TradingCompetiton(event.address.toHexString());
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

  tradingComp.regTime = event.params._regTime;
  tradingComp.save();
}
export function handleNewStartTime(event: NewStartTime): void {
  let tradingComp = TradingCompetiton.load(event.address.toHexString());
  if (tradingComp === null) {
    tradingComp = new TradingCompetiton(event.address.toHexString());
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

  tradingComp.startTime = event.params._startTime;
  tradingComp.save();
}
export function handleRegister(event: Register): void {
  let tradingComp = TradingCompetiton.load(event.address.toHexString());
  if (tradingComp === null) {
    tradingComp = new TradingCompetiton(event.address.toHexString());
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

  tradingComp.totalParticipants = tradingComp.totalParticipants.plus(ONE_BI);
  tradingComp.save();

  let user = User.load(event.params._address.toHexString());
  let userComp = UserParticipatedTradingCompetiton.load(
    event.params._address
      .toHexString()
      .concat("_")
      .concat(event.address.toHexString())
  );
  log.info("PARTICIPATED TRADE 196 :::: {}", [
    event.params._address
      .toHexString()
      .concat("_")
      .concat(event.address.toHexString()),
  ]);
  if (userComp === null) {
    userComp = new UserParticipatedTradingCompetiton(
      event.params._address
        .toHexString()
        .concat("_")
        .concat(event.address.toHexString())
    );
    userComp.competitionAddress = event.address.toHexString();
    userComp.participant = event.params._address.toHexString();
    userComp.totalTxns = ZERO_BI;
    userComp.totalBuyTxnsToken0 = ZERO_BI;
    userComp.totalBuyTxnsToken1 = ZERO_BI;
    userComp.totalVolumeInToken0 = ZERO_BD;
    userComp.totalVolumeInToken1 = ZERO_BD;
  }

  if (user === null) {
    user = new User(event.params._address.toHexString());
    user.competitions = [];
  }
  let tempComps = user.competitions;
  if (tempComps !== null) {
    tempComps.push(userComp.id);
  }
  userComp.competition = tradingComp.id;

  user.competitions = tempComps;
  user.save();
  tradingComp.save();
  userComp.save();
}
export function handleRemovePair(event: RemovePair): void {}
