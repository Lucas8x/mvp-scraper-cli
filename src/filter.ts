import type {
  GetMonsterResponse,
  Spawn,
  Stats,
} from 'divine-pride-api-wrapper';

function filterMaps(maps: Spawn[]): Partial<Spawn>[] {
  const filteredMaps = maps
    .filter(({ respawnTime }) => respawnTime > 0)
    .map(({ mapname, respawnTime }) => {
      return {
        mapname,
        respawnTime,
      };
    });
  return filteredMaps;
}

function filterStats(
  stats: Stats,
  desiredStats: string[] = []
): Partial<Stats> {
  return desiredStats.length
    ? Object.keys(stats)
        .filter((item) => desiredStats.includes(item))
        .reduce((filteredStats, item) => {
          filteredStats[item] = stats[item];
          return filteredStats;
        }, {})
    : stats;
}

export function filterMvp(
  mvp: GetMonsterResponse,
  desiredStats: string[] = []
) {
  return {
    id: mvp.id,
    dbname: mvp.dbname,
    name: mvp.name,
    spawn: filterMaps(mvp.spawn),
    stats: filterStats(mvp.stats, desiredStats),
  };
}
