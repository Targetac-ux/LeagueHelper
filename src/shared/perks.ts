export interface Rune {
  id: number;
  key: string;
  icon: string;
  name: string;
  shortDesc: string;
  longDesc: string;
}

export interface RuneSlot {
  runes: Rune[];
}

export interface PerkStyle {
  id: number;
  key: string;
  icon: string;
  name: string;
  slots: RuneSlot[];
}

export interface PerkPage {
  id: number;
  name: string;
  primaryStyleId: number;
  subStyleId: number;
  selectedPerkIds: number[];
  current: boolean;
}

export interface PerkPageRequest {
  name: string;
  primaryStyleId: number;
  subStyleId: number;
  selectedPerkIds: number[];
}

export interface StatShard {
  id: number;
  name: string;
  icon: string;
}

export const STAT_SHARD_SLOTS: StatShard[][] = [
  [
    { id: 5008, name: 'Adaptive Force', icon: 'perk-images/StatMods/StatModsAdaptiveForceIcon.png' },
    { id: 5005, name: 'Attack Speed', icon: 'perk-images/StatMods/StatModsAttackSpeedIcon.png' },
    { id: 5007, name: 'Ability Haste', icon: 'perk-images/StatMods/StatModsCDRScalingIcon.png' },
  ],
  [
    { id: 5008, name: 'Adaptive Force', icon: 'perk-images/StatMods/StatModsAdaptiveForceIcon.png' },
    { id: 5002, name: 'Armor', icon: 'perk-images/StatMods/StatModsArmorIcon.png' },
    { id: 5003, name: 'Magic Resist', icon: 'perk-images/StatMods/StatModsMRIcon.png' },
  ],
  [
    { id: 5001, name: 'Health', icon: 'perk-images/StatMods/StatModsHealthScalingIcon.png' },
    { id: 5002, name: 'Armor', icon: 'perk-images/StatMods/StatModsArmorIcon.png' },
    { id: 5003, name: 'Magic Resist', icon: 'perk-images/StatMods/StatModsMRIcon.png' },
  ],
];
