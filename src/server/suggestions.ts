interface ChampionInfo {
  id: string;
  name: string;
  image: string;
}

interface MasteryData {
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
}

interface ChampSelectSession {
  actions: Array<Array<{ id: number; actorCellId: number; championId: number; type: string; completed: boolean }>>;
  myTeam: Array<{ cellId: number; championId: number; selectedSkinId: number; spell1Id: number; spell2Id: number }>;
  theirTeam: Array<{ cellId: number; championId: number; selectedSkinId: number; spell1Id: number; spell2Id: number }>;
  localPlayerCellId: number;
  pickableChampionIds: number[];
}

export interface Suggestion {
  championId: number;
  championName: string;
  score: number;
  reasons: string[];
}

type MakeRequest = <T>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, body?: unknown) => Promise<T>;

// Simplified counter matchups: [counterId, counteredId][]
const COUNTER_DATA: Array<[number, number]> = [
  [266, 1],   // Aatrox counters Annie
  [103, 157], // Ahri counters Yasuo
  [84, 11],   // Akali counters Master Yi
  [12, 238],  // Alistar counters Jax
  [32, 24],   // Amumu counters Jax
  [34, 67],   // Anivia counters Vayne
  [1, 62],    // Annie counters Wukong
  [22, 75],   // Ashe counters Nasus
  [136, 157], // Aurelion Sol counters Yasuo
  [268, 238], // Azir counters Jax
  [432, 62],  // Bard counters Wukong
  [53, 120],  // Blitzcrank counters Ezreal
  [63, 42],   // Brand counters Rammus
  [201, 22],  // Braum counters Ashe
  [51, 131],  // Caitlyn counters Diana
  [69, 96],   // Cassiopeia counters Kog'Maw
  [31, 24],   // Cho'Gath counters Jax
  [42, 75],   // Corki counters Nasus
  [122, 67],  // Darius counters Vayne
  [131, 120], // Diana counters Ezreal
  [119, 157], // Draven counters Yasuo
  [36, 75],   // Dr. Mundo counters Nasus
  [245, 67],  // Ekko counters Vayne
  [60, 238],  // Elise counters Jax
  [28, 120],  // Evelynn counters Ezreal
  [81, 11],   // Ezreal counters Master Yi
  [9, 62],    // Fiddlesticks counters Wukong
  [114, 238], // Fiora counters Jax
  [105, 96],  // Fizz counters Kog'Maw
  [3, 67],    // Galio counters Vayne
  [41, 75],   // Gangplank counters Nasus
  [86, 24],   // Garen counters Jax
  [150, 157], // Gnar counters Yasuo
  [79, 11],   // Gragas counters Master Yi
  [104, 120], // Graves counters Ezreal
  [120, 238], // Hecarim counters Jax
  [122, 157], // Hecarim counters Yasuo (duplicate, using different)
  [74, 62],   // Heimerdinger counters Wukong
  [39, 1],    // Irelia counters Annie
  [40, 96],   // Janna counters Kog'Maw
  [59, 238],  // Jarvan IV counters Jax
  [24, 120],  // Jax counters Ezreal
  [126, 67],  // Jayce counters Vayne
  [202, 157], // Jhin counters Yasuo
  [222, 11],  // Jinx counters Master Yi
  [145, 96],  // Kai'Sa counters Kog'Maw
  [429, 120], // Kalista counters Ezreal
  [43, 24],   // Karma counters Jax
  [30, 75],   // Karthus counters Nasus
  [38, 238],  // Kassadin counters Jax
  [55, 67],   // Katarina counters Vayne
  [10, 157],  // Kayle counters Yasuo
  [141, 62],  // Kayn counters Wukong
  [85, 96],   // Kennen counters Kog'Maw
  [121, 238], // Kha'Zix counters Jax
  [203, 67],  // Kindred counters Vayne
  [240, 75],  // Kled counters Nasus
  [96, 120],  // Kog'Maw counters Ezreal
  [7, 238],   // LeBlanc counters Jax
  [64, 157],  // Lee Sin counters Yasuo
  [89, 62],   // Leona counters Wukong
  [127, 11],  // Lissandra counters Master Yi
  [236, 120], // Lucian counters Ezreal
  [117, 96],  // Lulu counters Kog'Maw
  [99, 67],   // Lux counters Vayne
  [54, 238],  // Malphite counters Jax
  [90, 120],  // Malzahar counters Ezreal
  [57, 157],  // Maokai counters Yasuo
  [11, 62],   // Master Yi counters Wukong
  [21, 75],   // Miss Fortune counters Nasus
  [62, 238],  // Wukong counters Jax
  [82, 67],   // Mordekaiser counters Vayne
  [25, 96],   // Morgana counters Kog'Maw
  [267, 11],  // Nami counters Master Yi
  [75, 120],  // Nasus counters Ezreal
  [111, 238], // Nautilus counters Jax
  [76, 157],  // Nidalee counters Yasuo
  [56, 62],   // Nocturne counters Wukong
  [20, 75],   // Nunu counters Nasus
  [2, 67],    // Olaf counters Vayne
  [61, 11],   // Orianna counters Master Yi
  [516, 238], // Ornn counters Jax
  [78, 120],  // Pantheon counters Ezreal
  [133, 157], // Quinn counters Yasuo
  [497, 62],  // Rakan counters Wukong
  [33, 96],   // Rammus counters Kog'Maw
  [421, 238], // Rek'Sai counters Jax
  [526, 67],  // Rell counters Vayne
  [58, 75],   // Renekton counters Nasus
  [107, 120], // Rengar counters Ezreal
  [92, 157],  // Riven counters Yasuo
  [68, 238],  // Rumble counters Jax
  [13, 62],   // Ryze counters Wukong
  [113, 67],  // Sejuani counters Vayne
  [35, 96],   // Shaco counters Kog'Maw
  [98, 120],  // Shen counters Ezreal
  [102, 157], // Shyvana counters Yasuo
  [27, 238],  // Singed counters Jax
  [14, 62],   // Sion counters Wukong
  [15, 75],   // Sivir counters Nasus
  [72, 67],   // Skarner counters Vayne
  [37, 11],   // Sona counters Master Yi
  [16, 120],  // Soraka counters Ezreal
  [50, 157],  // Swain counters Yasuo
  [517, 62],  // Sylas counters Wukong
  [134, 238], // Syndra counters Jax
  [223, 67],  // Tahm Kench counters Vayne
  [245, 11],  // Taliyah counters Master Yi
  [44, 96],   // Taric counters Kog'Maw
  [73, 120],  // Teemo counters Ezreal
  [412, 157], // Thresh counters Yasuo
  [350, 62],  // Tristana counters Wukong
  [48, 75],   // Trundle counters Nasus
  [29, 238],  // Tryndamere counters Jax
  [91, 67],   // Twisted Fate counters Vayne
  [8, 96],    // Vladimir counters Kog'Maw
  [112, 120], // Viktor counters Ezreal
  [254, 157], // Vi counters Yasuo
  [234, 238], // Viego counters Jax
  [112, 11],  // Viktor counters Master Yi
  [498, 75],  // Xayah counters Nasus
  [145, 67],  // Kai'Sa counters Vayne
  [246, 120], // Qiyana counters Ezreal
  [777, 157], // Yone counters Yasuo
  [887, 11],  // Sett counters Master Yi
  [888, 62],  // Lillia counters Wukong
  [894, 238], // Senna counters Jax
  [895, 75],  // Nilah counters Nasus
  [902, 67],  // Akshan counters Vayne
  [910, 120], // K'Sante counters Ezreal
  [950, 238], // Naafiri counters Jax
];

// Synergy data: [championId, synergizesWithId]
const SYNERGY_DATA: Array<[number, number]> = [
  [99, 7],    // Lux + LeBlanc (burst mage synergy)
  [117, 96],  // Lulu + Kog'Maw (hypercarry support)
  [40, 96],   // Janna + Kog'Maw (peel for hypercarry)
  [412, 157], // Thresh + Yasuo (blade hook into ult)
  [53, 238],  // Blitzcrank + Jax (hook into stun)
  [111, 53],  // Nautilus + Blitzcrank (hook chain)
  [267, 53],  // Nami + Blitzcrank (bubble into hook)
  [432, 157], // Bard + Yasuo (tunnel into ult)
  [86, 157],  // Garen + Yasuo (knockup into ult)
  [16, 86],   // Soraka + Garen (sustain for juggernaut)
  [76, 120],  // Nidalee + Hecarim (spear into gank)
  [89, 96],   // Leona + Kog'Maw (all-in peel)
  [7, 89],    // LeBlanc + Leona (burst + engage)
  [25, 92],   // Morgana + Riven (bind into engage)
  [37, 92],   // Sona + Riven (speed boost + engage)
  [54, 157],  // Malphite + Yasuo (knockup synergy)
  [3, 157],   // Galio + Yasuo (knockup synergy)
  [112, 67],  // Viktor + Vayne (slow into condemn)
  [145, 117], // Kai'Sa + Lulu (hypercarry)
  [429, 412], // Kalista + Thresh (soulbound engage)
  [61, 122],  // Orianna + Hecarim (speed boost + shockwave)
  [201, 61],  // Braum + Orianna (disengage into shockwave)
  [62, 84],   // Wukong + Akali (aoe into shroud)
  [131, 84],  // Diana + Akali (aoe burst combo)
  [238, 131], // Jax + Diana (dive combo)
  [104, 86],  // Graves + Garen (front to back)
  [120, 61],  // Ezreal + Orianna (poke + shockwave)
  [75, 210],  // Kayle + Nasus (scaling duo)
  [41, 54],   // Gangplank + Malphite (barrel into knockup)
];

interface OwnedChampion {
  championId: number;
  owned: boolean;
}

export async function getSuggestions(
  makeRequest: MakeRequest,
  champions: Record<string, ChampionInfo>,
): Promise<Suggestion[]> {
  try {
    const [sessionResult, masteryResult, ownedResult] = await Promise.all([
      makeRequest<ChampSelectSession>('GET', '/lol-champ-select/v1/session').catch(() => null),
      makeRequest<MasteryData[]>('GET', '/lol-champion-mastery/v1/local-player/champion-mastery').catch(() => []),
      makeRequest<{ champions: OwnedChampion[] }>('GET', '/lol-champions/v1/owned-champions-minimal').catch(() => null),
    ]);

    if (!sessionResult) return [];

    const masteryMap = new Map<number, MasteryData>();
    for (const m of masteryResult) {
      masteryMap.set(m.championId, m);
    }

    const ownedSet = new Set<number>(
      ownedResult?.champions?.filter((c) => c.owned).map((c) => c.championId) ?? [],
    );

    const enemyPicks = new Set<number>(
      sessionResult.theirTeam?.map((p) => p.championId).filter((id) => id !== 0) ?? [],
    );

    const allyPicks = new Set<number>(
      sessionResult.myTeam
        ?.filter((p) => p.cellId !== sessionResult.localPlayerCellId)
        .map((p) => p.championId)
        .filter((id) => id !== 0) ?? [],
    );

    const pickableSet = new Set(sessionResult.pickableChampionIds);

    const suggestions: Suggestion[] = [];

    for (const champId of pickableSet) {
      const champInfo = Object.values(champions).find((c) => parseInt(c.id, 10) === champId);
      if (!champInfo) continue;

      const reasons: string[] = [];
      let score = 0;

      // Mastery score
      const mastery = masteryMap.get(champId);
      if (mastery) {
        const masteryScore = Math.min(mastery.championLevel * 20 + Math.floor(mastery.championPoints / 10000), 100);
        score += masteryScore;
        if (mastery.championLevel >= 5) {
          reasons.push(`High mastery (Level ${mastery.championLevel})`);
        }
      }

      // Counter score - champion counters enemies
      for (const [counter, countered] of COUNTER_DATA) {
        if (counter === champId && enemyPicks.has(countered)) {
          const counteredName = champions[String(countered)]?.name ?? `Champion ${countered}`;
          score += 15;
          reasons.push(`Counters ${counteredName}`);
        }
      }

      // Synergy score - champion synergizes with allies
      for (const [champ, synergizesWith] of SYNERGY_DATA) {
        if (champ === champId && allyPicks.has(synergizesWith)) {
          const allyName = champions[String(synergizesWith)]?.name ?? `Champion ${synergizesWith}`;
          score += 10;
          reasons.push(`Synergizes with ${allyName}`);
        }
      }

      // Ownership bonus
      if (ownedSet.has(champId)) {
        score += 5;
      } else {
        score -= 20;
      }

      suggestions.push({
        championId: champId,
        championName: champInfo.name,
        score,
        reasons: reasons.slice(0, 3),
      });
    }

    suggestions.sort((a, b) => b.score - a.score);
    return suggestions.slice(0, 10);
  } catch {
    return [];
  }
}
