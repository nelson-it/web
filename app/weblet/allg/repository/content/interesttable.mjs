//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/repository/content/interesttable.mjs
//================================================================================
'use strict';

import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneElement  from '/weblet/basic/element.mjs'
import MneDbTableView from '/weblet/db/table/view.mjs'

class MneRepositoryInterestTable extends MneDbTableView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = {};
    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  reset()
  {
    super.reset();
    this.obj.run.readpar = Object.assign(this.obj.run.readpar, this.initpar.readpar );
  }
  
  async download()
  {
    var w;
    if ( ! ( w = this.obj.weblets['show'] ) )
    {
      var self = this;
      w = await this.createpopup('show');
      w.initpar.namename = 'filename';
      w.getData = async () =>
      {
        var p = Object.assign({}, this.obj.run.readpar)
        p.hash = ( typeof this.obj.run.values.hash != 'undefined' ) ? this.obj.run.values.hash : "";

        console.log(p)
        var res = await MneRequest.fetch('db/utils/repository/download.dat', p, true);
        return await res.blob();
      }
    }
 
    await w.show();
    w.newvalues = true;
    await w.check_values();

    return false;
  }

  async values()
  {
    this.obj.run.readpar['repositoryidInput.old'] = this.config.dependweblet.obj.run.values.repositoryid;
    this.obj.run.readpar['filenameInput.old'] = this.config.dependweblet.obj.run.values.menuid;
    this.obj.defvalues.filename = this.config.dependweblet.obj.run.values.menuid;
    
    var tbody = this.obj.tables.content.querySelector('tbody')
    if ( tbody ) tbody.innerHTML = '';
    
    if ( ! this.obj.run.readpar['filenameInput.old'] )
    {
      this.enable('', false);
      return;
    }

    return super.values();
  }
}

export default MneRepositoryInterestTable;
