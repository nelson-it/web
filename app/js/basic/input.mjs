// ================================================================================
//
// Copyright: M.Nelson - technische Informatik
//            Die Software darf unter den Bedingungen 
//            der APGL ( Affero Gnu Public Licence ) genutzt werden
//            
//    datei: js/basic/input.mjs
//================================================================================
'use strict';

export class MneInput
{
  static getInputTyp(displaytyp, defaulttyp)
  {
    var t = Number(displaytyp);
    switch(t)
    {
    case 1000:
       return 'datetime';
    case 1001:
       return 'date';
    case 1002:
    case 1003:
      return 'time';
    case 1020:
       return 'color';
    default:
       return ( defaulttyp ) ? defaulttyp : 'modify';
    }
  }
}

MneInput.checktype = {};  

export default MneInput