//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/repository/admin/fileoverview.mjs
//================================================================================
'use strict';

import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneElement  from '/weblet/basic/element.mjs'
import MneTableDynamic from '/weblet/allg/table/dynamic.mjs'

class MneRepositoryFileOverview extends MneTableDynamic
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        frameclass : 'weblet-allg-repository',

        datastart : 5,
        dataid : 'personid',

        schema : 'mne_repository',
        query  : 'filedata_interests',

        cols : 'filename,fullname,haverank,haverankstyle,personid,rank,shortrev,repdate,repnote',
        scols : 'filename,fullname',

        showids : [ "repositoryid" ],
        
        tablehidecols : [ 'haverankstyle', 'personid' ],
        tablecolstyle : { haverank : 'haverankstyle' },
        
    }
    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  getCssPath()  {  return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + 'allg/repository/repository.css'; }

}

export default MneRepositoryFileOverview;
