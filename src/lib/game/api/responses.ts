import type Player from "../player";
import type { PlayerData, SettlementData } from "./models";

export interface NewGameData {
    players: PlayerData[];
    settlements: SettlementData[];
}