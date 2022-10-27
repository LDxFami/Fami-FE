/* eslint-disable import/no-mutable-exports */
/* eslint-disable no-undef */
import devSettings from './dev';
import stagSettings from './stag';
import prodSettings from './prod';
require('dotenv').config()
let settings = {};

switch (process.env.MODE) {
  case 'staging':
    settings = stagSettings;
    break;
  case 'production':
    settings = prodSettings;
    break;
  default:
    settings = devSettings;
    break;
}
export default settings;
