import { filterMvp } from '../src/filter';

describe('Filter', () => {
  it('Should return a filtered mvp', () => {
    expect.assertions(1);

    const mvpData = {
      id: 1234,
      dbname: 'MYCUSTOMMVP',
      name: 'My Custom Mvp',
      spawn: [
        {
          mapname: 'prt_field08',
          amount: 1,
          respawnTime: 3600000,
        },
        {
          mapname: 'pay_field01',
          amount: 1,
          respawnTime: 0,
        },
      ],
      stats: {
        level: 56,
        baseExperience: 10000,
      },
    };

    //@ts-ignore-next-line
    const filteredMvp = filterMvp(mvpData, ['level']);

    const expectMvpData = {
      id: 1234,
      dbname: 'MYCUSTOMMVP',
      name: 'My Custom Mvp',
      spawn: [
        {
          mapname: 'prt_field08',
          respawnTime: 3600000,
        },
      ],
      stats: {
        level: 56,
      },
    };

    expect(filteredMvp).toMatchObject(expectMvpData);
  });
});
