//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/repository/admin/detail.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneDbView   from '/weblet/db/view.mjs'

class MneRepositoryDetail extends MneDbView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
     frameclass : 'weblet-allg-repository',

      url       : 'db/utils/repository/data.json',
      addurl    : 'db/utils/repository/insert.json',
      modurl    : 'db/utils/repository/modify.json',
      delurl    : 'db/utils/repository/delete.json',
      commiturl : 'db/utils/repository/commit.json',
      sendurl   : 'db/utils/trust/repmail.json',

      showids       : ['repositoryid'],
      
      delids        : [ 'root', 'repositoryid'],
      delconfirmids : [ 'name'],

      root      : 'repository',

      hinput : true
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  getViewPath() {  return this.getView(import.meta.url) }
  getCssPath()  {  return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + 'allg/repository/repository.css'; }

  reset()
  {
    super.reset();
    this.obj.run.readpar = { schema : 'mne_repository', query : 'repository', table : 'repository', "rootInput.old" : this.initpar.root };
    this.obj.run.addpar  = { schema : 'mne_repository', table : 'repository' };
    this.obj.run.modpar  = { schema : 'mne_repository', table : 'repository' };
    this.obj.run.delpar  = { schema : 'mne_repository', table : 'repository',  "rootInput.old" : this.initpar.root };
    
    this.obj.defvalues.root = this.initpar.root;
    
    this.obj.mkbuttons.push({ id : 'commit', value : MneText.getText('#mne_lang#Änderungen akzeptieren#'), space : 'before'})
    this.obj.mkbuttons.push({ id : 'send',   value : MneText.getText('#mne_lang#Versenden'),  after : 'commit' })
  }
  
  async commit()
  {
    var p = 
    {
        'rootInput.old'         : this.initpar.root,
        'repositoryidInput.old' : this.obj.run.values.repositoryid,
        'commitmessageInput'    : this.obj.inputs.commitmessage.getValue(),
    }
    await MneRequest.fetch(this.initpar.commiturl, p);
    this.dependweblet = this;
  }
  
  async send ()
  {
    var p = {};
    
    p = this.addParam(p, "repositoryid", this.obj.inputs.repositoryid );

    var res = await MneRequest.fetch(this.initpar.sendurl, p);
    
    if ( ! res.result )
      MneLog['error'](res);
      
    this.dependweblet = this;
  };

}

export default MneRepositoryDetail;
