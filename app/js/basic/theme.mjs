// ================================================================================
//
// Copyright: M.Nelson - technische Informatik
//            Die Software darf unter den Bedingungen 
//            der APGL ( Affero Gnu Public Licence ) genutzt werden
//            
//    datei: js/basic/theme.mjs
//================================================================================
'use strict';

class MneTheme
{
  static loadCss(href, root)
  {
    if ( ! href ) return;
    
    root = ( root ) ? root : this.stylePath;
    var path = ( href[0] != '/' ) ? path = root +  MneTheme.theme + '/' + href : href;
    var index = root + MneTheme.theme + '/' + href;
    var num = MneTheme.stylesnum.length;

    if ( typeof MneTheme.styles[index] != 'undefined' ) return;

    var head = document.getElementsByTagName('head')[0];
    var style = document.createElement("link");
    style.rel = "stylesheet";
    style.type = "text/css";
    head.appendChild(style);

    MneTheme.stylesnum[num] = { root : root, href : href };
    MneTheme.styles[index] = { href : href, root : root, path : path, style : style };

    var addstyle = function(path)
    {
      if ( MneTheme.styles[index] == undefined ) return;
      MneTheme.styles[index].style.href = path;
    }

    fetch(path).then( (res) => { addstyle( ( res.ok ) ? path : root + '/' + href ) } )
               .catch(()    => { addstyle(root + '/' + href ) } );
  };

  static setTheme(theme)
  {
    if ( MneTheme.theme == '/' + theme ) return;

    var i = 0;
    var s = MneTheme.stylesnum;
    var head = document.getElementsByTagName('head')[0];

    for ( i in MneTheme.styles)
      head.removeChild(MneTheme.styles[i].style);

    MneTheme.styles = {};
    MneTheme.stylesnum = new Array();
    MneTheme.theme = '/' + theme;

    for ( i=0; i < s.length; i++)
      this.loadCss(s[i].href, s[i].root);
  };

};

MneTheme.theme = '/';
MneTheme.stylesnum = new Array()
MneTheme.styles = {}
MneTheme.stylePath = "styles/basic"


export default MneTheme;