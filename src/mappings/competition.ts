import {
  NewEndTime,
  NewRegTime,
  NewStartTime,
  RemovePair,
} from "./../../generated/TradingCompFactory/TradingComp";
import { Address } from "@graphprotocol/graph-ts";

import { Pair, TradingCompetiton } from "../../generated/schema";
import {
  NewPairSet,
  OwnershipTransferred,
  Register,
} from "./../../generated/templates/TradingComp/TradingComp";
import { UniswapPair } from "./../../generated/templates/TradingComp/UniswapPair";
import { ONE_BI, ZERO_BD, ZERO_BI } from "../../helpers/constants";
import { UniswapPair as PairTemplate } from "../../generated/templates";
import { saveToken } from "../entities/token";
export function handleNewPairSet(event: NewPairSet): void {
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
    PairTemplate.create(event.params._pair);
  }
  let pair = Pair.load(event.params._pair.toString());
  const pairContract = UniswapPair.bind(event.params._pair);
  if (pairContract !== null) {
    const token0Address = (pairContract as UniswapPair).try_token0();
    const token1Address = (pairContract as UniswapPair).try_token1();

    if (!token0Address.reverted) {
      if (tradingComp.token0 === null) {
        tradingComp.token0 = token0Address.value.toString();
      }
      saveToken(
        Address.fromString(token0Address.value.toHexString()),
        ZERO_BI,
        event
      );
    }
    if (!token1Address.reverted) {
      if (tradingComp.token1 === null) {
        tradingComp.token1 = token1Address.value.toString();
      }
      saveToken(
        Address.fromString(token1Address.value.toHexString()),
        ZERO_BI,
        event
      );
    }

    if (pair === null) {
      pair = new Pair(event.params._pair.toString());
      pair.reserve0 = ZERO_BD;
      pair.reserve1 = ZERO_BD;
      pair.totalSupply = ZERO_BD;
      pair.volumeToken0 = ZERO_BD;
      pair.volumeToken1 = ZERO_BD;
      pair.txCount = ZERO_BI;
    }

    const reserves_try = (pairContract as UniswapPair).try_getReserves();

    if (!reserves_try.reverted) {
      const reserves = reserves_try.value;
      pair.reserve0 = reserves.get_reserve0().toBigDecimal();
      pair.reserve1 = reserves.get_reserve1().toBigDecimal();
    }

    pair.save();
  }

  let parsedPairs = tradingComp.pairs;
  if (parsedPairs!==null) {
    const uniquePairsSet = parsedPairs.filter(function(x, i, a) {
      return a.indexOf(x) == i;
    });
    parsedPairs = uniquePairsSet;
    if (parsedPairs !== null) {
      parsedPairs.push(event.params._pair.toString());
    }
    tradingComp.pairs = parsedPairs;
  }

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
export function handleRegister(event: Register): void {}
export function handleRemovePair(event: RemovePair): void {}
