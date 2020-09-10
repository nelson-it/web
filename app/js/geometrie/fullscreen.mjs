//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/geometrie/fullscreen.mjs
//================================================================================
'use strict';
import MneElement from '/weblet/basic/element.mjs'

export class MneFullscreen
{
  static isfullscreen(ele)
  {
     return ( ele ) ?  MneElement.hasClass(ele, 'fullscreen_active') || MneElement.hasClass(ele.parentNode, 'fullscreen') : false;
  }
  
  static fullscreen(button, frame )
  {
    if ( ! MneElement.hasClass(button, 'fullscreen_active') )
    {
      frame.stylesave =
      {
          parentNode : frame.parentNode,
          node       : frame.nextSibling,
          style      : 
          {
            position   : frame.style.postion,
            left       : frame.style.left,
            top        : frame.style.top,
            height     : frame.style.height,
            width      : frame.style.width,
            zIndex     : frame.style.zIndex
          }
      };
      frame.stylesave.back = window.document.createElement("div");
      frame.stylesave.back.className = "fullscreen";
      frame.stylesave.back.id = "fullscreen";

      document.body.appendChild(frame.stylesave.back);
      frame.stylesave.back.appendChild(frame);

      MneElement.mkClass(button, "fullscreen_active");
    }
    else
    {
      var save = frame.stylesave;
      var i;
      
      try{ document.body.removeChild(frame.stylesave.back); } catch(e) {};

      if ( save.node == null )
        save.parentNode.appendChild(frame);
      else
        save.parentNode.insertBefore(frame, save.node);

      for ( i in save.style ) frame.style[i] = save.style[i];

      MneElement.clearClass(button, "fullscreen_active" );
    }

  }
}

export default MneFullscreen
