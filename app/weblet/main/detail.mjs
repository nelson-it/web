//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/main/detail.mjs
//================================================================================
'use strict';

import MneGeometrie from '/weblet/basic/geometrie.mjs'

export class MneMainDetail extends MneGeometrie
{

  constructor(parent, frame, id = 'main', initpar = {}, config = {} )
  {
    var ivalues =
    {
        settitle : true,
    };

    super( parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  async check_values()
  {
    await super.check_values();

    if ( this.obj.mainweblet )
    {
      var val = ( this.obj.weblets[this.obj.mainweblet].obj.run.savevalues ) ? JSON.stringify(this.obj.weblets[this.obj.mainweblet].obj.run.savevalues) : JSON.stringify(this.obj.weblets[this.obj.mainweblet].obj.run.values);
      
      if ( val != this.obj.historyval || this.obj.historyname != this.obj.name )
      {
        this.obj.historyval = val;
        this.obj.historyname = this.obj.name;
        
        window.sessionStorage.setItem(window.mne_application + ':' + this.obj.name, val); 
        if ( ! window.mne_inpopstate ) window.history.pushState({ menu : window.mne_application, name : this.obj.name, values : this.obj.weblets[this.obj.mainweblet].obj.run.values}, document.title);
      }
    }
  }
}

export default MneMainDetail
