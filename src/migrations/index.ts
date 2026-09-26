import * as migration_20260925_164000_initial from './20260925_164000_initial';
import * as migration_20260926_131842_company_photos from './20260926_131842_company_photos';

export const migrations = [
  {
    up: migration_20260925_164000_initial.up,
    down: migration_20260925_164000_initial.down,
    name: '20260925_164000_initial',
  },
  {
    up: migration_20260926_131842_company_photos.up,
    down: migration_20260926_131842_company_photos.down,
    name: '20260926_131842_company_photos'
  },
];
