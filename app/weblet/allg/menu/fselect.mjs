//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/menu/fselect.mjs
//================================================================================
'use strict';
import MneFixMenu from './fix.mjs'

export class MneSelectFixMenu extends MneFixMenu
{

  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    initpar.nowebletframe = 0;
    initpar.delbutton = 'cancel,add,del';
    initpar.nobuttonframe = false;
    
    super( parent, frame, id, initpar, config );
  }
  
  reset()
  {
      super.reset();

      var res = { ids : [], rids : {} } ;
      this.obj.showcolnames.forEach((item, index) => { res.ids[index]  = item; res.rids[item] = index; });
      this.obj.run.result = res;
    }
  
  async action_show(data, dblclick )
  {
    if ( ! dblclick )
    {
      var values = this.obj.run.values = [ [] ];
      this.obj.showcolnames.forEach((item, index) => { values[0][index] = data.values[0].values[index+1]; });
    }
    else
    {
      await this.ok();
      return this.cancel();
    }
  }
  
  async ok()
  {
    var res;
    
    res = Object.assign({}, this.obj.run.result );
    res.values = [ ... this.obj.run.values];
    
    if ( this.initpar.selectok )
      await this.initpar.selectok(res);
  }
  
  async cancel()
  {
    await this.close();
  }

}

export default MneSelectFixMenu
