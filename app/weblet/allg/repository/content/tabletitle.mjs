//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/repository/content/tabletitle.mjs
//================================================================================
'use strict';

import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneElement from '/weblet/basic/element.mjs'
import MneView    from '/weblet/basic/view.mjs'

class MneRepositoryTableTitle extends MneView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = {};
    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  reset()
  {
    super.reset();
    
    this.initpar.nowebletframe = false;
    this.initpar.notitleframe = true;
    this.obj.mkbuttons = [];
    
    this.obj.htmlcontent = '<div class="inputarea"><div class="inputgroup"><div class=inputsingle><span id="nameLabel"></span><span id="nameOutput"></span></div></div></div>'
  }
  
  get wcol() { return ''};
  get wop()  { return ''};
  get wval() { return ''};
  
  async load()
  {
    await super.load();
    this.obj.labels.name.setValue(MneText.getText("#mne_lang#Datei"));
  }
  
  async values()
  {
    this.obj.outputs.name.setValue(this.config.dependweblet.obj.run.values.menuid ?? '');
  }
}

export default MneRepositoryTableTitle;
