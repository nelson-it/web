//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/repository/admin/reference.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneDbView   from '/weblet/db/view.mjs'

class MneRepositoryReference extends MneDbView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
     frameclass : 'weblet-allg-repository',
      notitleframe   : true,

      url       : 'db/utils/repository/data.json',
      addurl    : 'db/utils/repository/insert.json',
      modurl    : 'db/utils/repository/modify.json',
      sendurl   : 'db/utils/trust/repmail.json',

      showids : [ 'refid' ],
      
      root      : 'repository',

      hinput : false
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  getViewPath() {  return this.getView(import.meta.url) }
  getCssPath()  {  return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + 'allg/repository/repository.css'; }

  reset()
  {
    super.reset();

    this.obj.run.readpar = { schema : 'mne_repository', query : 'repository', table : 'repository', 'rootInput.old' : this.initpar.root };
    this.obj.run.addpar  = { schema : 'mne_repository', table : 'repository' };
    this.obj.run.modpar  = { schema : 'mne_repository', table : 'repository' };
 
    this.obj.defvalues.root = this.initpar.root;
    this.obj.mkbuttons.push({ id : 'send',   value : MneText.getText('#mne_lang#Versenden'),  after : 'commit' })
    
    this.setbuttonpar('ok', 'value', MneText.getText("#mne_lang#Hinzufügen"));
  }
  
  async send ()
  {
    var p = {};
    
    p = this.addParam(p, "repositoryid", this.obj.inputs.repositoryid );

    await MneRequest.fetch(this.initpar.sendurl, p);
    this.dependweblet = this;
  };
  
  async values()
  {
    this.obj.defvalues['name'] = this.config.dependweblet.obj.run.values[this.initpar.refname];
    this.obj.defvalues['refid'] = this.config.dependweblet.obj.run.values[this.initpar.refid];
    this.obj.defvalues['repositoryid'] = '################';
    await super.values();

    MneElement.mkClass(this.obj.container.weblet, 'avaible' + (( this.obj.run.okaction == 'add' ) ? 'not' : '') , true, 'avaible' );
    if ( ! this.config.dependweblet.obj.run.values[this.initpar.refid] || this.config.dependweblet.obj.run.values[this.initpar.refid]  == '################')
      this.enable('', false);
  }
}

export default MneRepositoryReference;
