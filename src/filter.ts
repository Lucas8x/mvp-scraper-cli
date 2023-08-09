import type {
  GetMonsterResponse,
  Spawn,
  Stats,
} from 'divine-pride-api-wrapper/build/types';

function filterMaps(maps: Spawn[]): Array<Partial<Spawn | undefined>> {
  return maps.map(({ mapname, respawnTime }) => {
    if (respawnTime !== 0) return;
    return {
      mapname,
      respawnTime,
    };
  });
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

export function filterMvp(mvp: GetMonsterResponse) {
  return {
    id: mvp.id,
    dbname: mvp['dbname'],
    name: mvp.name,
    spawn: filterMaps(mvp.spawn),
    stats: filterStats(mvp.stats),
  };
}
