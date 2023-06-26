//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/db/config.mjs
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
        "sqlstart" : 1,
        "sqlend" : 1
    };

    p.push(MneRequest.fetch("db/utils/query/data.json", param))
    
    // Gruppen
    // =======
    param =
    {
        "schema" : "mne_application",
        "query"  : "usergroup",
        "cols"   : "group,ismember",
        "rolnameInput.old" : "session_user",
        "sqlstart" : 1,
        "sqlend" : 1
    };

    p.push(MneRequest.fetch("db/utils/query/data.json", param));

    // regexp 
    // =======
    param =
    {
        "schema" : "mne_application",
        "table"  : "tableregexp",
        "cols"   : "tableregexpid,regexp,regexphelp,regexpmod",
        "sqlstart" : 1,
        "sqlend" : 1
    };

    p.push(MneRequest.fetch("db/utils/table/data.json", param));

    // Locale
    // =======
    p.push ( MneRequest.fetch("utils/locale.json"));
    

    resall = await Promise.all(p);

    res = resall[0];
    if ( res.values.length > 0 )
    {
      for ( i = 0; i<res.ids.length; i++)
        MneConfig[res.ids[i]] = res.values[0][i];
    }
    
    if ( MneConfig.cstartweblet )
    {
      var s;
      eval('MneConfig.startweblet = ' + MneConfig.cstartweblet);

      try { s = JSON.parse(window.sessionStorage.getItem(MneConfig.startweblet.appl + ':startweblet')); } catch(e) { s = '' };

      if ( !s )
        window.sessionStorage.setItem(MneConfig.startweblet.appl + ':startweblet', JSON.stringify(MneConfig.startweblet.weblet))
    }

    res = resall[1];
    if ( res.values.length > 0 )
    {
      for ( i = 0; i<res.values.length; i++)
        MneConfig.group[res.values[i][0]] = ( res.values[i][1] == '1' || MneConfig.loginname == 'admindb' );
    }
    
    res = resall[2];
    res.values.forEach((item, index) => 
    {
      MneInput.checktype[item[res.rids['tableregexpid']]] = { reg : new RegExp(item[res.rids['regexp']], item[res.rids['regexpmod']]), help : item[res.rids['regexphelp']]};
    })

    res = resall[3];
    if ( res.values.length > 0 )
    {
      MneConfig.locale  = 
      {
          language      : MneConfig.language,
          region        : MneConfig.region,
          decimal_point : res.values[0][res.rids['decimal_point']],
          thousands_sep : res.values[0][res.rids['thousands_sep']]
      };

      switch(MneConfig.region)
      {
        case 'US':
          MneConfig.locale.lcode = 'en-US';
          break;
        case 'GB':
          MneConfig.locale.lcode = 'en-GB';
          break;
        case 'CH':
          MneConfig.locale.lcode = 'de-CH';
          break;
        default:
          MneConfig.locale.lcode = 'de-DE';
          break;
      }

      MneConfig.hostname = res.values[0][res.rids['hostname']];

      var d = res.values[0][res.rids['decimal_point']]; if ( d == '.' ) d = "\\" + d;
      var t = res.values[0][res.rids['thousands_sep']]; if ( t == '.' ) t = "\\" + t;

      var datetime =
      {
        de : '^\\s*$|^\\s*(3[01]|[12][0-9]|0?[1-9])\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])\\.(1[012]|0?[1-9])\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])\\.(1[012]|0?[1-9])\\.((?:|19|20)\\d{2})\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])\\.(1[012]|0?[1-9])\\.((?:|19|20)\\d{2})\\s+(\\d{1,2})\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])\\.(1[012]|0?[1-9])\\.((?:|19|20)\\d{2})\\s+(\\d{1,2}:\\d{1,2})\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])\\.(1[012]|0?[1-9])\\.((?:|19|20)\\d{2})\\s+(\\d{1,2}:\\d{1,2}:\\d{1,2})\\s*$',
                            
        fr : '\\s*^$|^\\s*(3[01]|[12][0-9]|0?[1-9])\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])-(1[012]|0?[1-9])\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])-(1[012]|0?[1-9])-((?:|19|20)\\d{2})\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])-(1[012]|0?[1-9])-((?:|19|20)\\d{2})\\s+(\\d{1,2})\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])-(1[012]|0?[1-9])-((?:|19|20)\\d{2})\\s+(\\d{1,2}:\\d{1,2})\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])-(1[012]|0?[1-9])-((?:|19|20)\\d{2})\\s+(\\d{1,2}:\\d{1,2}:\\d{1,2})\\s*$',
                            
        en : '\\s*^$|^\\s*(3[01]|[12][0-9]|0?[1-9])\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])\\/(1[012]|0?[1-9])\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])\\/(1[012]|0?[1-9])\\/((?:|19|20)\\d{2})\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])\\/(1[012]|0?[1-9])\\/((?:|19|20)\\d{2})\\s+(\\d{1,2})\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])\\/(1[012]|0?[1-9])\\/((?:|19|20)\\d{2})\\s+(\\d{1,2}:\\d{1,2})\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])\\/(1[012]|0?[1-9])\\/((?:|19|20)\\d{2})\\s+(\\d{1,2}:\\d{1,2}:\\d{1,2})\\s*$',

        US : '\\s*^$|^\\s*(1[012]|0?[1-9])\\s*$|' +
             '^\\s*(1[012]|0?[1-9])\\/(3[01]|[12][0-9]|0?[1-9])\\s*$|' +
             '^\\s*(1[012]|0?[1-9])\\/(3[01]|[12][0-9]|0?[1-9])\\/((?:|19|20)\\d{2})\\s*$|' +
             '^\\s*(1[012]|0?[1-9])\\/(3[01]|[12][0-9]|0?[1-9])\\/((?:|19|20)\\d{2})\\s+(\\d{1,2})\\s*$|' +
             '^\\s*(1[012]|0?[1-9])\\/(3[01]|[12][0-9]|0?[1-9])\\/((?:|19|20)\\d{2})\\s+(\\d{1,2}:\\d{1,2})\\s*$|' +
             '^\\s*(1[012]|0?[1-9])\\/(3[01]|[12][0-9]|0?[1-9])\\/((?:|19|20)\\d{2})\\s+(\\d{1,2}:\\d{1,2}:\\d{1,2})\\s*$',
      };

      var date =
      {
        de : '\\s*^$|^\\s*(3[01]|[12][0-9]|0?[1-9])\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])\\.(1[012]|0?[1-9])\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])\\.(1[012]|0?[1-9])\\.((?:|19|20)\\d{2})\\s*$',
                            
        fr : '\\s*^$|^\\s*(3[01]|[12][0-9]|0?[1-9])\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])-(1[012]|0?[1-9])\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])-(1[012]|0?[1-9])-((?:|19|20)\\d{2})\\s*$',
                            
        en : '\\s*^$|^\\s*(3[01]|[12][0-9]|0?[1-9])\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])\\/(1[012]|0?[1-9])\\s*$|' +
             '^\\s*(3[01]|[12][0-9]|0?[1-9])\\/(1[012]|0?[1-9])\\/((?:|19|20)\\d{2})\\s*$',

        US : '\\s*^$|^\\s*(1[012]|0?[1-9])\\s*$|' +
             '^\\s*(1[012]|0?[1-9])\\/(3[01]|[12][0-9]|0?[1-9])\\s*$|' +
             '^\\s*(1[012]|0?[1-9])\\/(3[01]|[12][0-9]|0?[1-9])\\/((?:|19|20)\\d{2})\\s*$',
             
      };
      
      MneInput.checktype.ok          = { reg : new RegExp("(?:.|\n)+|^$"), help : ''};
      MneInput.checktype.float       = { reg : new RegExp("[+-]?[0-9" + t + "]+" + d + "?[0-9]*"), help : MneText.sprintf(MneText.getText("#mne_lang#Bitte eine Zahl mit einem $1 eingeben"), MneConfig.locale.decimal_point) };
      MneInput.checktype.floatoempty = { reg : new RegExp("[+-]?[0-9" + t + "]*" + d + "?[0-9]*|^$"), help : MneText.sprintf(MneText.getText("#mne_lang#Bitte eine Zahl mit einem $1 eingeben oder leer lassen"), MneConfig.locale.decimal_point) };

      MneInput.checktype.datetime     = { reg : new RegExp(datetime[MneConfig.locale.region] ?? datetime[MneConfig.locale.language]), help : MneText.sprintf(MneText.getText("Bitte ein Datum mit Zeit in der Form $1 eingeben"), MneText.toDateTime(new Date().getTime() / 1000 )) };
      MneInput.checktype.date         = { reg : new RegExp(    date[MneConfig.locale.region] ??     date[MneConfig.locale.language]), help : MneText.sprintf(MneText.getText("Bitte ein Datum in der Form $1 eingeben"), MneText.toDate(new Date().getTime() / 1000 )) };
      MneInput.checktype.time         = { reg : new RegExp('\\s*^$|\\s*(\\d{1,2})\\s*$|\\s*(\\d{1,2}:\\d{1,2})\\s*$|\\s*(\\d{1,2}:\\d{1,2}:\\d{1,2})\\s*$'), help : MneText.sprintf(MneText.getText("Bitte ein Zeit in der Form $1 eingeben"), MneText.toTime(new Date().getTime() / 1000 )) };
      MneInput.checktype.interval     = MneInput.checktype.time;
      MneInput.checktype.timenotempty = { reg : new RegExp('\\s*(\\d{1,2})\\s*$|\\s*(\\d{1,2}:\\d{1,2})\\s*$|\\s*(\\d{1,2}:\\d{1,2}:\\d{1,2})\\s*$'), help : MneText.sprintf(MneText.getText("Bitte ein Zeit in der Form $1 eingeben"), MneText.toTime(new Date().getTime() / 1000 )) };
      
    }
    
    console.log(MneInput.checktype)
    console.log(MneConfig)
  }
}

export default MneDbConfig
