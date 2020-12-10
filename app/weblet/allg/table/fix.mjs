//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/table/fix.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneElement from '/weblet/basic/element.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'

import { MneViewContainer } from '/weblet/basic/view.mjs'

class MneTable extends MneViewContainer
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
      tableweblet  : 'db/table/view',
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config);
  }
  
  reset()
  {
    super.reset();
    this.initpar.drop = false;
  }
  
  getViewPath() { return this.getView(import.meta.url) }
  getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }
 
  async getTableWeblet(path, par = '')
  {
    var self = this;
    let { default: TableWeblet } =  await MneRequest.import(path + '.mjs' + par);
    class MyTableWeblet extends TableWeblet
    {
      async loadview()
      {
        await super.loadview()
        this.obj.container.button = this.parent.obj.container.button;
      }
    }
    return MyTableWeblet;
  }
  
  async getWhereWeblet(path, par = '')
  {
    let { default: WhereWeblet } =  await MneRequest.import(path + '.mjs' + par);
    return WhereWeblet;
  }
  
  async load()
  {
    var reload = this.config.reload;
    var path;
    var initpar;
    var config;
    var whereframe;
    var tableframe;
    
    this.obj.wherenum = MneTable.wherecount++;
    await super.load();

    this.frame.insertBefore(( whereframe = document.createElement('div')), this.obj.container.weblet);
    this.obj.whereobserver = new MutationObserver( (mutations, server) => { if ( this.obj.container.weblet ) this.obj.container.weblet.style.top = whereframe.offsetHeight + 'px' });
    this.obj.whereobserver.observe(whereframe, { attributes: true, childList: true, characterData: true, subtree : true });
    
    path = ( this.initpar.tableweblet[0] == '/' ) ? this.initpar.tableweblet : '/weblet/' + this.initpar.tableweblet;
    initpar = Object.assign(Object.assign(Object.assign({}, this.initorig), { popup : undefined, notitleframe : true, selectlistids : this.initpar.selectlistids ?? this.id }), this.initpar.tableinit ?? {} );
    config = Object.assign(Object.assign({},  this.config ), { path : path, depend : this.config.depend, dependweblet : this } );

    var TableWeblet =  await this.getTableWeblet(path, ( reload ) ? '?date=' + Date.now() : '');
    this.obj.weblets.table = new TableWeblet(this, ( tableframe = this.frame.querySelector('#tablecontent')), 'table', initpar, config );
    this.obj.weblets.table.obj.run.newvalues = true;
    await this.obj.weblets.table.load();

    if ( this.initpar.whereweblet != undefined )
    {
      path = ( this.initpar.whereweblet[0] == '/' ) ? this.initpar.whereweblet : this.getPath(import.meta.url) + '/where/' + this.initpar.whereweblet;
      initpar = Object.assign(Object.assign(Object.assign({}, this.initorig), { popup : undefined, nowebletframe : true, selectlistids : this.initpar.selectlistids ?? this.id  }), this.initpar.whereinit ?? {} );
      config = Object.assign(Object.assign({}, this.config ), { path : path, depend : [], dependweblet : this  });

      var WhereWeblet =  await this.getWhereWeblet(path, ( reload ) ? '?date=' + Date.now() : '');
      this.obj.weblets.where = new WhereWeblet(this, whereframe, 'where', initpar, config );
      this.obj.weblets.where.obj.run.newvalues = true;
      await this.obj.weblets.where.load();
 
      this.obj.weblets.table.obj.where = this.obj.weblets.where;
      this.obj.weblets.where.obj.table = this.obj.weblets.table;
    }

    MneElement.mkClass(whereframe, 'tablewhere' );
    MneElement.mkClass(tableframe, 'tablecontent' );
  }
  
  async values(param)
  {
    this.obj.run.origvalues = Object.assign({}, (( this.config.dependweblet ) ? this.config.dependweblet.obj.run.values : {}));
    this.obj.run.values = Object.assign({}, this.obj.run.origvalues);
    
    if ( this.obj.weblets.where ) await this.obj.weblets.where.values(param);
    return this.obj.weblets.table.values(param);
  }
  
  async query()
  {
    this.obj.lastquery = ! this.obj.lastquery;
    Array.from(Object.keys(this.obj.weblets)).forEach((item) => { this.obj.weblets[item].obj.lastquery = this.obj.lastquery });
    
    MneElement.mkClass(this.obj.buttons.query, 'active', this.obj.lastquery );
  }
}
MneTable.wherecount = 0;
export default MneTable
