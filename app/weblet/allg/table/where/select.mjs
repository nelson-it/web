// ================================================================================
//
// Copyright: M.Nelson - technische Informatik
//            Die Software darf unter den Bedingungen 
//            der APGL ( Affero Gnu Public Licence ) genutzt werden
//            
//    datei: weblet/allg/table/where/select.mjs
//================================================================================
'use strict';

import MneConfig from '/js/basic/config.mjs'
import MneText   from '/js/basic/text.mjs'
import MneLog    from '/js/basic/log.mjs'


import MneViewWeblet     from '/weblet/basic/view.mjs'

class MneTableWhereSelectWeblet extends MneViewWeblet
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    super(parent, frame, id, initpar, config);
  }
  
  reset()
  {
    super.reset();
    
    this.obj.mkbuttons = [];
  }
  
  getViewPath() { return this.getView(import.meta.url) }
  getCssPath() { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }
  
  
  async loadview()
  {
    var self = this;

    await super.loadview();
    this.obj.container.content.addEventListener('keyup', function(evt)
    {
      evt.stopPropagation();
      switch(evt.key)
      {
        case "Enter":
          self.btnClick('ok', { target : evt.target }, this, evt );
          break;
        default:
          break;
      }
    });

    this.obj.container.content.addEventListener('keydown', function(evt)
    {
      evt.stopPropagation();
      switch(evt.key)
      {
        case "Tab":
          self.parent.values();
          evt.preventDefault();
          break;
        default:
          break;
      }
    });
  }
  
  set viewpar(par)
  {
    var i;
    var wcol;
    
    var self = this;
    this.obj.viewpar = Object.assign({}, par);
    
    wcol = this.obj.inputs['wcol'];
    wcol.innerHTML = '<option value="">' + MneText.getText('#mne_lang#Gesamte Tabelle') + '</option>';
    
    for ( i =0; i<this.obj.viewpar.ids.length; ++i)
    {
      wcol.appendChild(document.createElement('option'));
      wcol.lastChild.appendChild(document.createTextNode( this.obj.viewpar.labels[i] ));
      wcol.lastChild.value = this.obj.viewpar.ids[i];
    }
    
    this.obj.wcol_observer = new MutationObserver((mut) => 
    {
      switch(self.obj.viewpar.typs[parseInt(wcol.selectedIndex) -1])
      {
        case '1':
          this.obj.inputs['wop'].innerHTML = '<option value="true">' + MneText.getText("#mne_lang#wahr") + '</option><option value="false">' + MneText.getText("#mne_lang#falsch") + '</option>';
          this.obj.inputs['wop'].setValue('true')
          break;
          
        case '2':
          this.obj.inputs['wop'].innerHTML = '<option value="=">=</option><option value="<>">&lt;&gt;</option><option value="<">&lt;</option><option value=">">&gt;</option><option value="<=">&lt;=</option><option value=">=">&gt;=</option><option value="isnull">' + MneText.getText('#mne_lang#leer') + '</option><option value="is not null">' + MneText.getText('#mne_lang#nicht leer') + '</option><option value="like">' + MneText.getText('#mne_lang#änhlich') + '</option>'
          this.obj.inputs['wop'].setValue('like')
          break;
          
        default:
          this.obj.inputs['wop'].innerHTML = '<option value="=">=</option><option value="<>">&lt;&gt;</option><option value="<">&lt;</option><option value=">">&gt;</option><option value="<=">&lt;=</option><option value=">=">&gt;=</option><option value="isnull">' + MneText.getText('#mne_lang#leer') + '</option><option value="is not null">' + MneText.getText('#mne_lang#nicht leer') + '</option>'
          this.obj.inputs['wop'].setValue('=')
          break;
      }
    });
    this.obj.wcol_observer.observe(wcol, { subtree: true, attributes : true, attributeFilter: [ 'selected' ] } );

    if ( this.initpar.selval >= 0 )
      wcol.children[parseInt(this.initpar.selval)+1].setAttribute("selected",true);
    
  }
  
  focus()
  {
    this.obj.inputs.wval.focus();
  }
  
  get wcol()
  {
    return this.obj.inputs.wcol.getValue(true);
  }

  get wop()
  {
    return this.obj.inputs.wop.getValue(true);
  }
  get wval()
  {
    var val = '%' + this.obj.inputs.wval.getValue(true);
    if ( val != '%' ) val += '%';
    return val;
  }
  
  async ok(data)
  {
    await this.initpar.ok(this.select);
    data.target.focus();
  }


}

export default MneTableWhereSelectWeblet;
