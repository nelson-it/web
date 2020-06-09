//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/user/settings.mjs
//================================================================================
'use strict';

import MneConfig   from '/js/basic/config.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneTheme    from '/js/basic/theme.mjs'

import MneDbConfig from '/js/db/config.mjs'


import MneDbViewWeblet     from '/weblet/db/view.mjs'

class MneUserSettingsWeblet extends MneDbViewWeblet
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
        schema : 'mne_application',
        query : 'userpref',
        table : 'userpref',
        
        delbutton : 'del,add',
          
        hinput : false
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    reset()
    {
      super.reset();

      this.obj.run.readpar = Object.assign(this.obj.run.readpar,
      {
             wcol : 'username',
             wop  : '=',
             wval : 'session_user'
      });

      this.obj.run.modpar = Object.assign(this.obj.run.modpar,
      {
             "usernameInput"     : 'session_user',
             "usernameInput.old" : 'session_user',
      });
    }
    
    getViewPath() { return this.getView(import.meta.url) }
    
    async ok()
    {
      var r = this.obj.inputs.regionselect.getValue().split(':');

      this.obj.inputs.region.modValue(r[0]);
      this.obj.inputs.mslanguage.modValue(r[1]);
      
      await super.ok();
      await MneDbConfig.read();
      MneTheme.setTheme(MneConfig.stylename);
    }
    
}

export default MneUserSettingsWeblet;
