interface PlayerData {
    name: string;
    location: { x: number; y: number };
}

interface SettlementData {
    name: string;
    location: { x: number; y: number };
}

export type { PlayerData, SettlementData };