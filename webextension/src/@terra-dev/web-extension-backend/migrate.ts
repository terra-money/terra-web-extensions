export { migrateCW20StorageV0 } from './interfaces/cw20/v0';
export { migrateNetworkStorageV0 } from './interfaces/network/v0';
export { migrateWalletsStorageV0 } from './interfaces/wallets/v0';

export function setDummyDataV0() {
  localStorage.setItem(
    'keys',
    JSON.stringify([
      {
        name: 'anchor-dev2',
        address: 'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9',
        wallet:
          '7c753f074a468487b0f09e15f6938b8b35d5480c51a23c3fbee5c52d998242a0qMqCBoKb9LFZe57V8poCyNeyOQEAujwog9Pwi9ZcXhB8BxtQC+AZVFSaVheVSuNcpAQmfBxG8Q2shnq176JTZU9QmJ6UNk2gcTIPp/9k1vJ6gyvdseCdvAhUMmfiiSJFEX5GTHrQEEVTvegAjpSPR1q/uHIU18mOn/5vEACSIePN4cuKl9Ah2zFgvk9a6vh/Wzj7MVbv43dNlxxlHgwjxy5cMYO3xtnzpewLQrYh5Papm0G9249TyEcmr1uR+3y1QuxFqrhD54sveRnblcDvAuhp/XnMJwIsZvUW9I9PypkHbrVhIK8Wkz1SFVWWWqks',
      },
      {
        name: 'tester1',
        address: 'terra1qd9fwwgnwmwlu2csv49fgtum3rgms64s8tcavp',
        wallet:
          '9f1b283d6720d76d4fa93b96fa3a9297f1fbdcc319f805912c065d4068d23fddqSXXyRlC92+I7DyUhzVFDY7IY9+Eaqx+Ge4IaXqFm6HGrQdWujZ8jQjV/G9eqeu+pL0JU+TgMtvd3Cwg0bGIw1Mlcmcqs5u1ofnbbUCyhOQZbAAMChJKTDx/8VSjGA1tQrvjCCt9PaXoqOt/FQJ0eYjEt8ou8fiZneZcW1u5RWCbOFKThK30nmuECO400EENeW4lTp0V5DboSPZ3dnPYV9LSIszKUsP8AWy/8m0fWNm7fbL22wDSb7N/SByrbexpGfmP5eplHaCzsbOgeB4WOE0eCUnBIUPI0wtNdSl5haYvQtzWsLizSYq11kfZe7/H',
      },
    ]),
  );

  localStorage.setItem(
    'settings',
    JSON.stringify({
      chain: 'testnet',
      lang: 'en',
      recentAddresses: [
        'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9',
        'terra1qd9fwwgnwmwlu2csv49fgtum3rgms64s8tcavp',
      ],
      user: {
        name: 'anchor-dev2',
        address: 'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9',
        wallet:
          '7c753f074a468487b0f09e15f6938b8b35d5480c51a23c3fbee5c52d998242a0qMqCBoKb9LFZe57V8poCyNeyOQEAujwog9Pwi9ZcXhB8BxtQC+AZVFSaVheVSuNcpAQmfBxG8Q2shnq176JTZU9QmJ6UNk2gcTIPp/9k1vJ6gyvdseCdvAhUMmfiiSJFEX5GTHrQEEVTvegAjpSPR1q/uHIU18mOn/5vEACSIePN4cuKl9Ah2zFgvk9a6vh/Wzj7MVbv43dNlxxlHgwjxy5cMYO3xtnzpewLQrYh5Papm0G9249TyEcmr1uR+3y1QuxFqrhD54sveRnblcDvAuhp/XnMJwIsZvUW9I9PypkHbrVhIK8Wkz1SFVWWWqks',
      },
      customNetworks: [
        {
          name: 'test',
          chainID: 'columnbus-4',
          lcd: 'https://lcd2.terra.dev',
          fcd: 'https://fcd2.terra.dev',
          localterra: false,
        },
      ],
    }),
  );

  localStorage.setItem(
    'tokens',
    JSON.stringify({
      testnet: {
        terra1747mad58h0w4y589y3sk84r5efqdev9q4r02pc: {
          protocol: 'Anchor',
          symbol: 'ANC',
          token: 'terra1747mad58h0w4y589y3sk84r5efqdev9q4r02pc',
          icon: 'https://whitelist.anchorprotocol.com/logo/ANC.png',
        },
      },
    }),
  );
}
