//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/repository/admin/sendoverview.mjs
//================================================================================
'use strict';

import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneElement  from '/weblet/basic/element.mjs'
import MneTableFix from '/weblet/allg/table/fix.mjs'

class MneRepositorySendOverview extends MneTableFix
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        frameclass : 'weblet-allg-repository',

        schema : 'mne_repository',
        query  : 'fileinterests',
        table  : 'fileinterests',

        cols : 'fileinterestsid,mustsend,fullname,active,filename,sendrank,lastresrank,repdate,lastrepdate,lastsend,lastrepnote',
        scols : 'fullname,filename',
        showids : [ 'repositoryid' ],

        tablehidecols: [ 'fileinterestsid', 'mustsend' ],
        tablerowstyle: [ 'send' ],
        tablerowstylecol : [ 'mustsend' ],
        tablecoltype     : { active : 'bool' },

        okcols : [ 'active' ],
        okids : ['fileinterestsid' ],

        delbutton : [ 'add', 'del' ]
    }
    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  getCssPath()  {  return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') +  'allg/repository/repository.css'; }

}

export default MneRepositorySendOverview;
