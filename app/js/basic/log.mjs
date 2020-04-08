// ================================================================================
//
// Copyright: M.Nelson - technische Informatik
//            Die Software darf unter den Bedingungen 
//            der APGL ( Affero Gnu Public Licence ) genutzt werden
//            
//    datei: js/basic/text.mjs
//================================================================================
'use strict';

export class MneLog
{
  static setMessageClient(client)
  {
    MneLog._messageClient = client;
  }

  static line(e)
  {
    console.log(e);
    if ( MneLog._messageClient != null ) MneLog._messageClient.line(e);
  }
  
  static message(e)
  {
    console.info(e);
    if ( MneLog._messageClient != null ) MneLog._messageClient.message(e);
  }

  static warning(e)
  {
    console.warn(e);
    if ( MneLog._messageClient != null ) MneLog._messageClient.warning(e);
  }

  static error(e)
  {
    console.error(e);
    if ( MneLog._messageClient != null ) MneLog._messageClient.error(e);
  }

  static exception(e)
  {
    if ( e.message != '')
    {
      console.error(e);
      if ( MneLog._messageClient != null ) MneLog._messageClient.exception(e);
    }
  }
}

MneLog._messageClient = null

export default MneLog