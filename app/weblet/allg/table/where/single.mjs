//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/table/where/single.mjs
//================================================================================
'use strict';

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
    
    if ( this.initpar.selval != undefined )
    {
      var selval = this.initpar.selval.split(':');
      this.obj.selpos = parseInt(selval[0]) + 1;
      this.obj.selval = selval[1];
      this.obj.selop  = selval[2];
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

  /**
   * @param {any} par
   */
  set viewpar(par)
  {
    var i;
    var str;
    var wcol = this.obj.inputs['wcol'];
    var value = wcol.getValue(false);
    var found = false;
    var self = this;

    this.obj.viewpar = Object.assign({}, par);
    
    str = '<option value="">' + MneText.getText('#mne_lang#Gesamte Tabelle') + '</option>';
    
    for ( i =0; i<this.obj.viewpar.ids.length; ++i)
    {
      if ( this.obj.viewpar.ids[i] == value ) found = true;
      
      str += '<option value="' + this.obj.viewpar.ids[i] + '"'
      if ( ( this.initpar.selcol && this.initpar.selcol == this.obj.viewpar.ids[i] ) || ( this.obj.selpos == ( i + 1 ) ) )
      {
        found = true;
        wcol.setValue(this.obj.viewpar.ids[i]);
        str += ' selected="selected"';
      }
      str += '>' + this.obj.viewpar.labels[i] + '</option>'
    }
    
    if ( found == false ) wcol.setValue('');
    
    wcol.innerHTML = str;
    if ( this.obj.selpos >= wcol.children.length )
      MneLog.warning("MneTableWhereSelectWeblet: Selval zu gross")

    var check_change = function () 
    {
      switch(self.obj.viewpar.typs[parseInt(wcol.selectedIndex) -1])
      {
        case '1':
          self.obj.inputs['wop'].innerHTML = '<option value="true">' + MneText.getText("#mne_lang#wahr") + '</option><option value="false">' + MneText.getText("#mne_lang#falsch") + '</option>';
          self.obj.inputs['wop'].modValue( self.obj.selop ?? self.initpar.selop ?? 'true')
          break;
          
        case '2':
          self.obj.inputs['wop'].innerHTML = '<option value="=">=</option><option value="<>">&lt;&gt;</option><option value="<">&lt;</option><option value=">">&gt;</option><option value="<=">&lt;=</option><option value=">=">&gt;=</option><option value="isnull">' + MneText.getText('#mne_lang#leer') + '</option><option value="is not null">' + MneText.getText('#mne_lang#nicht leer') + '</option><option value="like">' + MneText.getText('#mne_lang#änhlich') + '</option>'
          self.obj.inputs['wop'].modValue(self.obj.selop ?? self.initpar.selop ?? 'like' )
          break;
          
        default:
          self.obj.inputs['wop'].innerHTML = '<option value="=">=</option><option value="<>">&lt;&gt;</option><option value="<">&lt;</option><option value=">">&gt;</option><option value="<=">&lt;=</option><option value=">=">&gt;=</option><option value="isnull">' + MneText.getText('#mne_lang#leer') + '</option><option value="is not null">' + MneText.getText('#mne_lang#nicht leer') + '</option>'
          self.obj.inputs['wop'].modValue(self.obj.selop ?? self.initpar.selop ?? '=' )
          break;
      }
      wcol.modClear();
    };

    wcol.addEventListener('change', check_change );
    this.obj.wcol_observer = new MutationObserver( check_change);
    this.obj.wcol_observer.observe(wcol, { subtree: true, attributes : true, attributeFilter: [ 'selected' ] } );
    check_change();
    this.obj.selop = this.initpar.selop = undefined;
  }
  
  focus()
  {
    this.obj.inputs.wval.focus();
  }
  
  get wcol()
  {
    return this.obj.inputs.wcol.getValue();
  }

  get wop()
  {
    var wcol = this.obj.inputs['wcol'];
    return ( ! wcol.getValue() ) ? '' : (( this.obj.viewpar.typs[parseInt(wcol.selectedIndex) -1] == '1' ) ? '=' : this.obj.inputs.wop.getValue(true));
  }

  get wval()
  {
    var wcol = this.obj.inputs['wcol'];
    
    if ( this.obj.viewpar.typs[parseInt(wcol.selectedIndex) -1] == '1' ) return this.obj.inputs.wop.getValue(true);
    if ( ! wcol.getValue() ) return '';

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
    if ( this.obj.selval && this.config.dependweblet.getValue ) this.obj.inputs.wval.setValue(this.config.dependweblet.getValue(this.obj.selval));
  }
}

export default MneWhereSelectWeblet;
