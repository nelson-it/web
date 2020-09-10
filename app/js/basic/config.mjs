//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/basic/config.mjs
//================================================================================
'use strict';

export class MneConfig
{
  static async read()
  {
    MneConfig.language = 'de';
    MneConfig.region = 'DE';
    MneConfig.locale = { language : 'de', region : 'DE' };
    MneConfig.group = {};
  }
  
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default MneConfig
