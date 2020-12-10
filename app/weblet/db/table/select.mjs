//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/db/table/select.mjs
//================================================================================
'use strict';

import MneConfig     from '/js/basic/config.mjs'
import MneText       from '/js/basic/text.mjs'
import MneLog        from '/js/basic/log.mjs'
import MneElement from '/weblet/basic/element.mjs'
import MneRequest    from '/js/basic/request.mjs'
import MnePopupWeblet   from '/weblet/basic/popup.mjs'

import MneDbTableBasic from './basic.mjs'

class MnePopupDetail extends MnePopupWeblet
{
  constructor( id, initpar = {}, config = {} )
  {
    super(id, initpar, config);
  }
  
  async getWeblet(path)
  {
    let { default: Weblet } = await MneRequest.import(path);
    
    class MyWeblet extends Weblet
    {
      async ok()
      {
        await super.ok();
        await super.values();
        
        if ( this.initpar.selectok)
          await this.initpar.selectok(this.obj.run.result);
        
        this.obj.popup.close();
        return false;
      }
    }
    return MyWeblet;
  }
}

class MneDbTableSelect extends MneDbTableBasic
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        delbutton : ['del', 'detaildel']
    };

    var cols = ( initpar.cols != '' ) ? initpar.cols.split(',') : [];
    var showcols = ( initpar.showcols != 'undefined' && initpar.showcols != '' ) ? initpar.showcols.split(',') : [];
    var hide = ( initpar.tablehidecols ) ?  initpar.tablehidecols : [];
    
    showcols.forEach((item, index) =>
    {
      if ( cols.indexOf(item) == -1 && item[0] != '#')
      {
        cols.push(item);
        hide.push(item);      
      }
    });
    
    initpar.cols = cols.join(',');
    initpar.tablehidecols = hide;

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  reset()
  {
    super.reset();
    this.obj.enablebuttons.values.push('ok');
  }

  async ok()
  {
    if ( this.initpar.selectok)
      await this.initpar.selectok(this.select);
    return this.cancel();
  }
  
  async cancel()
  {
    await this.parent.close();
  }
  
  async opendetail(detail)
  {
    if ( this.obj.popups[detail] == undefined )
    {
      var p = this.config.composeparent.obj.popups[detail];
      this.obj.popups[detail] = new MnePopupDetail(p.id, Object.assign({selectok : this.initpar.selectok }, p.initpar), p.config);
    }

    await this.openpopup(detail);
    
    return this.cancel();
  }

  async detail()
  {
    return this.opendetail(this.initpar.detailweblet);
  }

  async detailadd()
  {
    return this.opendetail(this.initpar.detailaddweblet);
  }
  
  async detailmod()
  {
    return this.opendetail(this.initpar.detailmodweblet);
  }
  
  async dblclick(data, obj, evt)
  {
    return this.ok();
  }
}

export default MneDbTableSelect
