//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/repository/content/interest.mjs
//================================================================================
'use strict';

import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneElement  from '/weblet/basic/element.mjs'
import MneFixTable from '/weblet/allg/table/fix.mjs'

class MneRepositoryInterest extends MneFixTable
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        frameclass : 'weblet-allg-repository',

        tableweblet : '/weblet/allg/repository/content/interesttable',
        whereweblet : '/weblet/allg/repository/content/tabletitle',

        readpar :
        {
          "rootInput.old" : 'repository',
        },

       schema : 'mne_repository',
       query  : 'fileinterests',
        scols : 'fullname',
        cols : 'fileinterestsid,personid,filename,mustsend,fullname,active,email,lastresrank,sendrank,lastrank',

        table         : 'fileinterests',
        showids       : ['repositoryid'],
        primarykey    : [ 'fileinterestsid' ],
        delconfirmids : [ 'fullname'],

     tablerowstyle    : [ 'send' ],
     tablerowstylecol : [ 'mustsend' ],

        tablehidecols: [ 'fileinterestsid', 'personid', 'filename', 'mustsend' ],
        tablecoltype  : { active : 'bool' },

        okids  : [ 'fileinterestsid' ],

        modcols : [ 'active' ],
        addcols : ['repositoryid', 'fileinterestsid', 'personid', 'filename', 'active' ],
        
       defvalues : { active : true },
        hinput : false
    }
    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  getCssPath()  {  return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + 'allg/repository/repository.css'; }

}

export default MneRepositoryInterest;
