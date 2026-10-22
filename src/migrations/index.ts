import * as migration_20260925_164000_initial from './20260925_164000_initial';
import * as migration_20260926_131842_company_photos from './20260926_131842_company_photos';
import * as migration_20261007_141623_stay_import from './20261007_141623_stay_import';
import * as migration_20261009_142042_content_import from './20261009_142042_content_import';
import * as migration_20261009_144634_property_remote_cover from './20261009_144634_property_remote_cover';
import * as migration_20261019_124840_assistant_settings from './20261019_124840_assistant_settings';
import * as migration_20261021_111150_district_guide from './20261021_111150_district_guide';
import * as migration_20261021_114026_district_mountains from './20261021_114026_district_mountains';
import * as migration_20261022_090000_rebrand_stay from './20261022_090000_rebrand_stay';

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
    name: '20261009_142042_content_import',
  },
  {
    up: migration_20261009_144634_property_remote_cover.up,
    down: migration_20261009_144634_property_remote_cover.down,
    name: '20261009_144634_property_remote_cover',
  },
  {
    up: migration_20261019_124840_assistant_settings.up,
    down: migration_20261019_124840_assistant_settings.down,
    name: '20261019_124840_assistant_settings',
  },
  {
    up: migration_20261021_111150_district_guide.up,
    down: migration_20261021_111150_district_guide.down,
    name: '20261021_111150_district_guide',
  },
  {
    up: migration_20261021_114026_district_mountains.up,
    down: migration_20261021_114026_district_mountains.down,
    name: '20261021_114026_district_mountains'
  },
  {
    up: migration_20261022_090000_rebrand_stay.up,
    down: migration_20261022_090000_rebrand_stay.down,
    name: '20261022_090000_rebrand_stay'
  },
];
