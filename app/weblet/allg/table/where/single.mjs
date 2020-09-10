//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/table/where/single.mjs
//================================================================================
'use strict';

import MneConfig from '/js/basic/config.mjs'
import MneText   from '/js/basic/text.mjs'
import MneLog    from '/js/basic/log.mjs'


import MneView     from '/weblet/basic/view.mjs'

class MneWhereSelectWeblet extends MneView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
    }

    super(parent, frame, id, Object.assign(ivalues, initpar), config);
  }
  
  reset()
  {
    super.reset();
    this.obj.mkbuttons = [];

    this.obj.selpos = 0;
    this.obj.selval = '';
    
    if ( this.initpar.selval )
    {
      var selval = this.initpar.selval.split(':');
      this.obj.selpos = parseInt(selval[0]) + 1;
      this.obj.selval = selval[1];
    }
  }
  
  getViewPath() { return this.getView(import.meta.url) }
  getCssPath() { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }
  
  async load()
  {
    await super.load();
    
    this.obj.observer.content.disconnect();
    delete this.obj.observer.content;
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
      if ( this.initpar.selcol && this.initpar.selcol == this.obj.viewpar.ids[i] ) wcol.lastChild.setAttribute('selected', 'selected');
    }

    var check_change = function () 
    {
      switch(self.obj.viewpar.typs[parseInt(wcol.selectedIndex) -1])
      {
        case '1':
          self.obj.inputs['wop'].innerHTML = '<option value="true">' + MneText.getText("#mne_lang#wahr") + '</option><option value="false">' + MneText.getText("#mne_lang#falsch") + '</option>';
          self.obj.inputs['wop'].setValue(( self.initpar.selop ) ? self.initpar.selop : 'true')
          break;
          
        case '2':
          self.obj.inputs['wop'].innerHTML = '<option value="=">=</option><option value="<>">&lt;&gt;</option><option value="<">&lt;</option><option value=">">&gt;</option><option value="<=">&lt;=</option><option value=">=">&gt;=</option><option value="isnull">' + MneText.getText('#mne_lang#leer') + '</option><option value="is not null">' + MneText.getText('#mne_lang#nicht leer') + '</option><option value="like">' + MneText.getText('#mne_lang#änhlich') + '</option>'
          self.obj.inputs['wop'].setValue(( self.initpar.selop ) ? self.initpar.selop : 'like')
          break;
          
        default:
          self.obj.inputs['wop'].innerHTML = '<option value="=">=</option><option value="<>">&lt;&gt;</option><option value="<">&lt;</option><option value=">">&gt;</option><option value="<=">&lt;=</option><option value=">=">&gt;=</option><option value="isnull">' + MneText.getText('#mne_lang#leer') + '</option><option value="is not null">' + MneText.getText('#mne_lang#nicht leer') + '</option>'
          self.obj.inputs['wop'].setValue(( self.initpar.selop ) ? self.initpar.selop : '=')
          break;
      }
      wcol.modClear();
    };

    wcol.addEventListener('change', check_change );
    this.obj.wcol_observer = new MutationObserver( check_change);
    this.obj.wcol_observer.observe(wcol, { subtree: true, attributes : true, attributeFilter: [ 'selected' ] } );

    if ( this.initpar.selval )
    {
      wcol.children[( this.obj.selpos < wcol.children.length ) ? this.obj.selpos : 0 ].setAttribute("selected", true);
      if ( this.obj.selpos >= wcol.children.length )
        MneLog.warning("MneTableWhereSelectWeblet: Selval zu gross")
    }
    else
      {
      check_change();
      }
    
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
    var val = this.obj.inputs.wval.getValue();
    
    if ( this.obj.inputs.wop.getValue(false) != 'like' || val.indexOf('%') != -1 )
      return val;
    
    val = '%' + val
    if ( val != '%' ) val += '%';
    return val;
  }
  
  async enter(data, obj, evt )
  {
    await this.obj.table.values();
    this.obj.inputs.wval.focus();
    
    return false;
  }
  
  async tab(data, obj, evt)
  {
    this.obj.table.values();

    evt.preventDefault();
    evt.stopPropagation();
    
    return false;
  }
  
  async values()
  {
    if ( this.obj.selval ) this.obj.inputs.wval.setValue(this.config.dependweblet.getValue(this.obj.selval));
  }
}

export default MneWhereSelectWeblet;
