//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/basic/input.mjs
//================================================================================
'use strict';

import MneConfig from './config.mjs'
import MneText   from './text.mjs'

export class MneInput
{
  static getTyp(typ)
  {
    switch(typ.toString())
    {
      case '1':
      case "bool":
        return "bool";
      case '2':
      case "char":
        return "char";
      case '3':
      case "short":
        return "short";
      case '4':
      case "long":
        return "long";
      case '5':
      case "float":
        return "float";
      case '6':
      case "double":
        return "double";

      case '100':
      case "binary":
        return "binary";

      case '1000':
      case "datetime":
        return "datetime";
      case '1001':
      case "date":
        return "date";
      case '1002':
      case "time":
        return "time";
      case '1003':
      case "interval":
        return "interval";
      case '1004':
      case "day":
        return "day";
      case '1005':
      case "quarter":
        return "quarter";
      case '1006':
      case "cdatetime":
        return "cdatetime";
      case '1007':
      case "cdate":
        return "cdate";
      case '1008':
      case "ctime":
        return "ctime";

      case '1010':
      case "email":
        return "email";
      case '1011':
      case "link":
        return "link";
      case '1012':
      case "http":
        return "http";

      case '1020':
      case 'color':
        return 'color';
      default: 
        console.info(MneText.getText('#mne_lang#unbekannter Typ') + ' ' + typ )
        return 'char';
    }
  }
  
  static getRegexptyp(typ)
  {
    switch(MneInput.getTyp(typ))
    {
      case "bool":
        return 'ok';
      case "short":
        return 'numoempty'
      case "long":
        return 'numoempty'
      case "float":
        return 'floatoempty';
      case "double":
        return 'floatoempty';
      case "color":
         return 'color';
      case "binary":
        return "ok";

      default: 
        return MneInput.getTyp(typ);
    }
  }

  static getValue(value, typ, raw)
  {
    value = value ?? '';
    
    switch(MneInput.getTyp(typ))
    {
      case "bool":
        return ( value != '' && value != '0' && value != 'false' && value != MneText.getText("#mne_lang#falsch"));
      case "short":
        return ( value !== '') ? parseInt(value) : 0;
      case "long":
        return ( value !== '') ? parseInt(value) : 0;
      case "float":
        if ( typeof value == 'number') return value;
        if ( MneConfig.locale.thousands_sep != "" ) value = value.replace(new RegExp("\\" + MneConfig.locale.thousands_sep, 'g'),'');
        return ( value !== '') ? parseFloat(value.replace(MneConfig.locale.decimal_point,'.')) : 0.0;
      case "double":
        if ( typeof value == 'number') return value;
        if ( MneConfig.locale.thousands_sep != "" ) value = value.replace(new RegExp("\\" + MneConfig.locale.thousands_sep, 'g'),'');
        return ( value !== '') ? parseFloat(value.replace(MneConfig.locale.decimal_point,'.')) : 0.0;

      case "binary":
        return "binary";

      case "datetime":
        return (raw ) ? (( !! value ) ? parseInt(value) : '') : MneInput.parseDateTime(value);
      case "date":
        return (raw ) ? (( !! value ) ? parseInt(value) : '') : MneInput.parseDate(value);
      case "time":
        return (raw ) ? (( !! value ) ? parseInt(value) : '') : MneInput.parseTime(value, true);
      case "interval":
        return (raw ) ? (( !! value ) ? parseInt(value) : '') : MneInput.parseTime(value, false);
      case "day":
        return parseInt(value);
      case "quarter":
        return parseInt(value);

      default: 
        return value;
    }
  }

  static modifyValue(value, typ, _format)
  {
    switch(MneInput.getTyp(typ))
    {
      case "date":
      case "datetime":
        return ( value.match(/^\s+$/) ) ? ((MneText.toDate(new Date().getTime() / 1000 )) + " ") : value;

      default: 
        return value;
    }
  }

  static mkNull(value)
  {
    return ( value == '' ) ? 0 : value;
  }
  
  static format(value, typ, format)
  {
    switch(MneInput.getTyp(typ))
    {
      case "bool":
        return (( value != '' && value != '0' && value != 0 && value != false && value != 'false' && value != MneText.getText("#mne_lang#falsch") ) ? '✔' : '' );
        //return (( value != '' && value != '0' && value != 0 && value != false && value != 'false' && value != MneText.getText("#mne_lang#falsch") ) ? '&#10004;' : '' );

      case "binary":
        return "binary";

      case "datetime":
        return MneText.toDateTime(value, format);
      case "date":
        return MneText.toDate(value, format);
      case "time":
        return MneText.toTime(value, format);
      case "interval":
        return MneText.toInterval(value, format);
      case "day":
        return MneText.toDay(value, format);
      case "quarter":
        return MneText.toQuater(value, format);
      
      case "cdate":
        return MneText.toDate((new Date(value.substr(4,4), parseInt(value.substr(2,2)) - 1, value.substr(0,2)).getTime()/1000));

      default: 
        return value;
    }
  }
  
  static mkCdate(value)
  {
      var d = new Date();
      d.setTime(value * 1000);
      return MneText.addNull(d.getDate(),2) + MneText.addNull((d.getMonth() + 1),2) + d.getFullYear();
  }
  
  static parseDateTime(value)
  {
    var v = value.split(/\s/);
    return MneInput.parseDate(v[0]) + MneInput.parseTime(v[1]);
  }
  
  static parseDate(value)
  {
    var error;
    var delimiter;
    var regexp;
    var offset;
    var t,m,j;

    value = value.toString();
    if ( value == '')return value;
    
    switch( MneConfig.language)
    {
      case 'de':
        delimiter = '.';
        regexp = /[^0123456789\.]/;
        value = value.replace(/-/g, ".");
        offset = 0;
        break;
      case 'en':
        delimiter = '/';
        regexp = /[^0123456789\/]/;
        value = value.replace(/-/g, "/");
        offset = 0;
        if ( MneConfig.locale.region == 'US' ) offset = 1;
        break;
      case 'fr':
        delimiter = '-';
        regexp = /[^0123456789\-]/;
        offset = 0;
        break;
    }

    var sarray = value.split(delimiter);
    error = error | regexp.test(value); 
    if ( sarray.length > 3 )
      error = true;

    var d = new Date();
    d.setUTCHours(0);
    d.setUTCMinutes(0);
    d.setUTCSeconds(0);
    d.setUTCMilliseconds(0);

    m = t = j = 0;
    if ( sarray.length > 2 && sarray[2] != "" )
    {
      t = Number(sarray[0 + offset]);
      m = Number(sarray[1 - offset]);
      j = Number(sarray[2]);
    }
    else if ( sarray.length > 1 && sarray[1] != "" )
    {
      t = Number(sarray[0 + offset]);
      m = Number(sarray[1 - offset]);
      j = d.getFullYear();
    }
    else if ( sarray.length > 0 )
    {
      if ( offset == 1 )
      {
        m = Number(sarray[0]);
        t = d.getDate();
      }
      else
      {
        t = Number(sarray[0]);
        m = d.getMonth() + 1;
      }
      j = d.getFullYear();
    }

    if ( j < 100 && j < 30 )
      j = j + 2000;
    else if ( j < 100 )
      j = j + 1900;

    if ( t < 1 || m < 1 || m > 12 )
      error = true;
    if ( ( m == 1 || m == 3 || m == 5 || m == 7 || m == 8 || m == 10 || m == 12 ) &&  t > 31  )
      error = true;
    else if ( ( m == 2 ) && ( j / 4 != Math.ceil( j/4 ) || j == 0 || j == 2000 ) && ( t > 28 ) )
      error = true;
    else if ( ( m == 2 ) && ( j / 4 == Math.ceil( j/4 ) ) && ( t > 29 ) )
      error = true;
    else if ( ( m == 4 || m == 6 ||  m == 9 || m == 11 ) && t > 30 )
      error = true;

    if ( error != true )
    {
      d = new Date(j,m-1,t,0,0,0,0,0);
      error = isNaN(d.getTime());
    }
    return ( ! error ) ?  ( d.getTime() / 1000 ) : undefined;
  }

  static parseTime(value = 0, clocktime = true )
  {
    var error;
    var delimiter;
    var regexp;

    delimiter = ':';
    regexp = /[^0123456789\:]/;

    value = value.toString();
    if ( value == '' ) return '';
    
    value = value.replace(/-/g, ":");
    var sarray = value.split(delimiter);

    var h,m,s;
    var error;

    error = regexp.test(value); 
    if ( sarray.length > 3 )
      error = true;

    h = m = s = 0;

    if ( sarray[0] == '' ) sarray[0] = 0;
    if ( sarray[1] == '' ) sarray[1] = 0;
    if ( sarray[2] == '' ) sarray[2] = 0;

    if ( sarray.length > 2  )
    {
      h = parseInt(sarray[0],10);
      m = parseInt(sarray[1],10);
      s = parseInt(sarray[2],10);
    }
    else if ( sarray.length > 1 )
    {
      h = parseInt(sarray[0],10);
      m = parseInt(sarray[1],10);
    }
    else if ( sarray.length > 0 )
    {
      h = parseInt(sarray[0],10);
    }

    if ( s < 0 || s > 60 || m < 0 || m > 60 )
      error = true;

    if ( clocktime == true && ( h < 0 || h > 23) )
      error = true;

    return ( ! error ) ? (  h * 3600 + m * 60 + s ) : undefined;
  }
  
  static readfile(file, _result )
  {
    return new Promise((resolve, _reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (evt) => { resolve(evt.target.result.split(',')[1]) };
      reader.onerror = (error) => { throw new Error(error) };
    });
  }
}

MneInput.checktype = {};  

export default MneInput
