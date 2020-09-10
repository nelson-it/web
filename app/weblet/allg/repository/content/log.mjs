//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/repository/content/log.mjs
//================================================================================
'use strict';

import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneElement  from '/weblet/basic/element.mjs'
import MneFixTable from '/weblet/allg/table/fix.mjs'

class MneRepositoryLog extends MneFixTable
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        frameclass : 'weblet-allg-repository',
        
        tableweblet : '/weblet/allg/repository/content/logtable',
        whereweblet : '/weblet/allg/repository/content/tabletitle',
        url     : '/db/utils/repository/dblog.json',

        readpar :
        {
          "rootInput.old" : 'repository',
                   schema : 'mne_repository',
                   query  : 'filedata',
                    scols : '!repdate',
        },
        cols : 'repositoryid,filename,hash,repauthor,repdate,repnote,shortrev,rank,origname',

        table         : 'filedata',
        showids       : ['repositoryid'],
        delconfirmids : [ 'name'],

        tablehidecols: [ 'repositoryid', 'filename', 'hash' ],
        tablecoltype  : { repnote : 'text', shortrev : 'text' },

        modschema   : 'mne_repository',
        modfunction : 'filedata_ok',
        modcols     : ['repositoryid','filename', 'hash', 'shortrev', 'repnote' ],
        
        primarykey : [ 'hash' ],

        hinput : false
    }
    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  getCssPath()  {  return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + 'allg/repository/repository.css'; }

}

export default MneRepositoryLog;
