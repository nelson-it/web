//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/user/passwd.mjs
//================================================================================
'use strict';

import MneConfig   from '/js/basic/config.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneTheme    from '/js/basic/theme.mjs'

import MneDbConfig from '/js/db/config.mjs'


import MneDbViewWeblet     from '/weblet/db/view.mjs'

class MneUserPasswdWeblet extends MneDbViewWeblet
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
        schema    : 'mne_application',
        query     : 'userpasswd',

        showids    : [ "username"] ,
        delbutton  : 'add,del', 

        modschema   : 'mne_catalog',
        modfunction : 'userpasswd',
        modcols     : ['username', 'passwd1'],
        modtyps     : {},

        hinput : false
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    reset()
    {
      super.reset();
    }

    getFunctionParamMod(p)
    {
      if ( this.obj.inputs.username.value == '' )
        throw new Error("#mne_lang#Die Person hat kein login");

      if ( this.obj.inputs.passwd1.value != this.obj.inputs.passwd2.value )
      {
        throw new Error("#mne_lang#Passworte sind nicht gleich");
      }
      
      return super.getFunctionParamMod(p);
    }
    
    getViewPath() { return this.getView(import.meta.url) }
}

export default MneUserPasswdWeblet;
