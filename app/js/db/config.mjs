//================================================================================

//Copyright: M.Nelson - technische Informatik
//Die Software darf unter den Bedingungen 
//der APGL ( Affero Gnu Public Licence ) genutzt werden

//datei: js/db/config.mjs
//================================================================================
'use strict';

import MneConfig  from '../basic/config.mjs'
import MneInput   from '../basic/input.mjs'
import MneText    from '../basic/text.mjs'
import MneRequest from '../basic/request.mjs'

class MneDbConfig extends MneConfig
{
  static async read()
  {
    await super.read();

    var p = [];
    var i;
    var res;
    var resall;
    
    var param =
    {
        "schema" : "mne_application",
        "query"  : "userpref",
        "usernameInput.old" : "session_user",
        "sqlend" : 1
    };

    p.push(MneRequest.fetch("/db/utils/query/data.json", param))
    
    // Gruppen
    // =======
    param =
    {
        "schema" : "mne_application",
        "query"  : "usergroup",
        "cols"   : "group,ismember",
        "rolnameInput.old" : "session_user",
        "sqlend" : 1
    };

    p.push(MneRequest.fetch("/db/utils/query/data.json", param));

    // Locale
    // =======
    p.push ( MneRequest.fetch("/utils/locale.json"));
    
    resall = await Promise.all(p);

    res = resall[0];
    if ( res.values.length > 0 )
    {
      for ( i = 0; i<res.ids.length; i++)
        MneConfig[res.ids[i]] = res.values[0][i];
    }

    res = resall[2];
    if ( res.values.length > 0 )
    {
      for ( i = 0; i<res.values.length; i++)
        MneConfig.group[res.values[i][0]] = ( res.values[i][1] == '1' || MneConfig.loginname == 'admindb' );
    }
    
    res = resall[0];
    if ( res.values.length > 0 )
    {
      MneConfig.locale  = 
      {
          decimal_point : res.values[0][res.rids['decimal_point']],
          thousands_sep : res.values[0][res.rids['thousands_sep']]
      };

      MneConfig.hostname = res.values[0][res.rids['hostname']];

      var d = res.values[0][res.rids['decimal_point']]; if ( d == '.' ) d = "\\" + d;
      var t = res.values[0][res.rids['thousands_sep']]; if ( t == '.' ) t = "\\" + t;


      MneInput.checktype.float       = { reg : new RegExp("[+-]?[0-9" + t + "]+" + d + "?[0-9]*"), help : MneText.sprintf(MneText.getText("#mne_lang#Bitte eine Zahl mit einem $1 eingeben"), MneConfig.locale.decimal_point) };
      MneInput.checktype.floatoempty = { reg : new RegExp("[+-]?[0-9" + t + "]*" + d + "?[0-9]*|^$"), help : MneText.sprintf(MneText.getText("#mne_lang#Bitte eine Zahl mit einem $1 eingeben oder leer lassen"), MneConfig.locale.decimal_point) };
    }
  }
}

export default MneDbConfig
