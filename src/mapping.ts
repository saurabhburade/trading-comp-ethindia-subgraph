import { ONE_BI, ZERO_BD, ZERO_BI } from "./../helpers/constants";
import {
  OwnershipTransferred,
  TradingCompDeployed,
} from "./../generated/TradingCompFactory/TradingCompFactory";
import {
  BaseTradingCompFactory,
  TradingCompetiton,
} from "./../generated/schema";
import { TradingComp } from "../generated/templates/TradingComp/TradingComp";
import {
  UniswapPair as PairTemplate,
  TradingComp as TradingCompTemplate,
} from "../generated/templates";
import { DataSourceContext } from "@graphprotocol/graph-ts";

export function handleNewTradingComp(event: TradingCompDeployed): void {
  let tradingComp = TradingCompetiton.load(
    event.params.compAddress.toHexString()
  );
  if (tradingComp === null) {
    tradingComp = new TradingCompetiton(event.params.compAddress.toHexString());
    tradingComp.totalParticipants = ZERO_BI;
    tradingComp.totalTxns = ZERO_BI;
    tradingComp.name = event.params.compName;
    tradingComp.totalBuyTxnsToken0 = ZERO_BI;
    tradingComp.totalBuyTxnsToken1 = ZERO_BI;
    tradingComp.totalVolumeInToken0 = ZERO_BD;
    tradingComp.totalVolumeInToken1 = ZERO_BD;
    tradingComp.startTime = ZERO_BI;
    tradingComp.endTime = ZERO_BI;
    tradingComp.regTime = ZERO_BI;
  
    TradingCompTemplate.create(event.params.compAddress);
  }

  let factory = BaseTradingCompFactory.load(event.address.toHexString());
  if (factory === null) {
    factory = new BaseTradingCompFactory(event.address.toHexString());
    factory.competitionsCount = ZERO_BI;
    factory.competitions = [];
  }
  factory.competitionsCount = factory.competitionsCount.plus(ONE_BI);

  let parsedComps: string[] = [];
  if (factory.competitions !== null) {
    parsedComps.push(tradingComp.id);
    factory.competitions = parsedComps;
  }
  factory.save();
  tradingComp.save();
}
export function handleOwnershipTransferred(event: OwnershipTransferred): void {}
