//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/repository/admin/interestoverview.mjs
//================================================================================
'use strict';

import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneElement  from '/weblet/basic/element.mjs'
import MneTableDynamic from '/weblet/allg/table/dynamic.mjs'

class MneRepositoryInterestOverview extends MneTableDynamic
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        frameclass : 'weblet-allg-repository',
        tableweblet : '/weblet/allg/repository/admin/interestoverviewtable',

        datastart : 5,
        dataid : 'personid',

        schema : 'mne_repository',
        query  : 'filedata_interests',

        cols : 'filename,fullname,haveinterest,haveintereststyle,personid,hash,shortrev,repdate,repnote',
        scols : 'filename,fullname',
        
        showids : [ "repositoryid" ],
        
        tablehidecols : ['hash', 'haveintereststyle', 'personid'],
        tablecoltype  : { shortrev : 'text', repnote : 'text' },
        tablecolstyle : { haveinterest : 'haveintereststyle' },
        
        modfunction : 'filedata_ok',
        modcols : [ 'repositoryid', 'filename', 'hash', 'shortrev', 'repnote'],
        
        primarykey : [ 'filename' ]
    }
    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  getCssPath()  {  return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + 'allg/repository/repository.css'; }
  
}

export default MneRepositoryInterestOverview;
