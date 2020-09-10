//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/basic/text.mjs
//================================================================================
'use strict';
import MneConfig from '/js/basic/config.mjs'

export class MneText
{
  static getText(str)
  {
    return ( str.indexOf('#mne_lang') == 0 ) ? str.substring(10) : str;
  }

  static sprintf(str)
  {
    var result = MneText.getText(str);
    var arg = arguments;
    var i,s;

    for ( i=1; i<arg.length; i++ )
    {
      s = "$" + i ;
      result = result.replace(s, arg[i] );
    }
    return result;
  }
  
  static addNull(value, size )
  {
    return value.toString().padStart(2, "0");
  };

  static getTimestamp() { return MneText.toDateTime((new Date()).getTime() / 1000); };

  static toDate(value)
  {
    if ( value == '' || value == 0 ) return '';
    var d = new Date();   

    var lang = ( MneConfig.language ) ? MneConfig.language : 'de';

    d.setTime(value * 1000 );
    switch(lang)
    {
    case 'en':
      if ( MneConfig.region == 'US' )
        return MneText.addNull(( d.getMonth() + 1 ),2) + "/" + MneText.addNull(d.getDate(),2) + "/" + MneText.addNull(d.getFullYear(),2);
      return MneText.addNull(d.getDate(),2) + "/" + MneText.addNull(( d.getMonth() + 1 ),2) + "/" + MneText.addNull(d.getFullYear(),2);

    case 'fr':
      return MneText.addNull(d.getDate(),2) + "-" + MneText.addNull(( d.getMonth() + 1 ),2) + "-" + MneText.addNull(d.getFullYear(),2);

    default:
      return MneText.addNull(d.getDate(),2) + "." + MneText.addNull(( d.getMonth() + 1 ),2) + "." + MneText.addNull(d.getFullYear(),2);
      
    }
  };

  static toTime (value, format)
  {
    if ( value == '' ) return '';
    if ( value == '0' ) { if ( format != 'l' ) return "00:00"; return "00:00:00"; }
    var d = new Date();   
    d.setTime(value * 1000 );
    if ( format != 'l' )
      return MneText.addNull(d.getHours(),2) + ":" + MneText.addNull(d.getMinutes(),2);
    
    return MneText.addNull(d.getHours(),2) + ":" + MneText.addNull(d.getMinutes(),2) + ":" + MneText.addNull(d.getSeconds(),2);
  };

  static toInterval(value, format)
  {
    var sign = "";
    
    if ( value == '0' ) { if ( format != 'l' ) return "00:00";  return "00:00:00"; }
    if ( value == '' ) return "";
    if ( value < 0 ) { sign = "-"; value = -value; }
    if ( format != 'l' )
      return sign + MneText.addNull(parseInt(value/3600),2) + ":" + MneText.addNull(parseInt((value - (parseInt(( value / 3600))*3600))/60),2);
    
    return sign + MneText.addNull(parseInt(value/3600),2) + ":" + MneText.addNull(parseInt((value - (parseInt(( value / 3600))*3600))/60),2) + ":" + MneText.addNull(value % 60,2);

  };

  static toDay(value)
  {
    switch(value + "")
    {
    case '1':
          return this.getText('#mne_lang#Sonntag');
    case '2':
          return this.getText('#mne_lang#Montag');
    case '3':
          return this.getText('#mne_lang#Dienstag');
    case '4':
          return this.getText('#mne_lang#Mittwoch');
    case '5':
          return this.getText('#mne_lang#Donnerstag');
    case '6':
          return this.getText('#mne_lang#Freitag');
    case '7':
          return this.getText('#mne_lang#Samstag');
    default:
      return value;
    }
  };

  static toQuarter(value, format)
  {
    if ( value == '' ) return "";
    if ( format == 't' || format == 'text' ) return value;
    
    var d = new Date();   
    d.setTime(value * 1000 );
    if ( format == 'y' || format == 'year')
      return d.getFullYear();
    
    return parseInt ( (d.getMonth() + 1) / 3 ) + 1 + "/" + d.getFullYear();

  };

  static toDateTime(value,format) { if ( value == '' || value == 0 ) return ''; return  MneText.toDate(value) + " " + MneText.toTime(value, format); };

  static mkValue (value)
  {
    if ( typeof value != 'string') return value;
    
    if ( MneConfig.locale.thousands_sep != '' )
      value = value.replace(new RegExp("\\" + MneConfig.locale.thousands_sep, "g"), "");
    if ( MneConfig.locale.decimal_point != '.' )
      value = value.replace(new RegExp("\\" + MneConfig.locale.decimal_point, "g"), ".");

    return value;
  };

  static mascarade_single (str, c, mc)
  {
    var m = ( typeof mc == 'undefined' ) ? m = '\\' + c : m = mc;
    var i;
    var alt,neu;

    neu = "";
    alt = str;
    while ( ( i= alt.indexOf(c)) != -1 )
    {
      neu += alt.substring(0,i) + m;
      alt = alt.substr(i+1);
    }
    neu += alt;
    return neu;
  }

  static mascarade(str)
  {
    var neu;
    
    neu = MneText.mascarade_single(str, '\\', '\\\\');
    neu = MneText.mascarade_single(neu, "'",  "\\'");
    neu = MneText.mascarade_single(neu, '\n', '\\n');

    return neu;

  };

}

export default MneText
