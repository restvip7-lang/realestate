import * as migration_20260925_164000_initial from './20260925_164000_initial';
import * as migration_20260926_131842_company_photos from './20260926_131842_company_photos';
import * as migration_20261007_141623_stay_import from './20261007_141623_stay_import';
import * as migration_20261009_142042_content_import from './20261009_142042_content_import';

export const migrations = [
  {
    up: migration_20260925_164000_initial.up,
    down: migration_20260925_164000_initial.down,
    name: '20260925_164000_initial',
  },
  {
    up: migration_20260926_131842_company_photos.up,
    down: migration_20260926_131842_company_photos.down,
    name: '20260926_131842_company_photos',
  },
  {
    up: migration_20261007_141623_stay_import.up,
    down: migration_20261007_141623_stay_import.down,
    name: '20261007_141623_stay_import',
  },
  {
    up: migration_20261009_142042_content_import.up,
    down: migration_20261009_142042_content_import.down,
    name: '20261009_142042_content_import'
  },
];
