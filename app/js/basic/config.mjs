// ================================================================================
//
// Copyright: M.Nelson - technische Informatik
//            Die Software darf unter den Bedingungen 
//            der APGL ( Affero Gnu Public Licence ) genutzt werden
//            
//    datei: js/basic/config.mjs
//================================================================================
'use strict';

export class MneConfig
{
  static async read()
  {
    MneConfig.language = 'de';
    MneConfig.locale = {};
    MneConfig.group = {};
  }
}

export default MneConfig
