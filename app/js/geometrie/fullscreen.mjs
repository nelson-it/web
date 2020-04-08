//
// Copyright: M.Nelson - technische Informatik
//            Die Software darf unter den Bedingungen 
//            der APGL ( Affero Gnu Public Licence ) genutzt werden
//            
//datei: js/geometrie/fullscreen.js
//================================================================================
'use strict';
import MneElement          from '/js/basic/element.mjs'

export class MneFullscreen
{
  static isfullscreen(ele)
  {
     return MneElement.hasClass(ele, 'fullscreen_active') || MneElement.hasClass(ele.parentNode, 'fullscreen')
  }
  
  static fullscreen(button, frame )
  {
    if ( ! MneElement.hasClass(button, 'fullscreen_active') )
    {
      frame.stylesave =
      {
          parentNode : frame.parentNode,
          node       : frame.nextSibling,
          position   : frame.style.postion,
          left       : frame.style.left,
          top        : frame.style.top,
          height     : frame.style.height,
          width      : frame.style.width,
          zIndex     : frame.style.zIndex
      };
      frame.stylesave.back = window.document.createElement("div");
      frame.stylesave.back.className = "fullscreen";
      frame.stylesave.back.id = "fullscreen";
      frame.style.positon = 'absolute';
      frame.style.top  = "0px";
      frame.style.left = "0px";
      frame.style.width = "100%";
      frame.style.height = "100%";

      document.body.appendChild(frame.stylesave.back);
      frame.stylesave.back.appendChild(frame);

      MneElement.mkClass(button, "fullscreen_active");
    }
    else
    {
      var save = frame.stylesave;
      try{ document.body.removeChild(frame.stylesave.back); } catch(e) {};

      if ( save.node == null )
        save.parentNode.appendChild(frame);
      else
        save.parentNode.insertBefore(frame, save.node);

      frame.style.positon = save.position;
      frame.style.top  = save.top;
      frame.style.left = save.left;
      frame.style.width = save.width;
      frame.style.height = save.height;

      MneElement.clearClass(button, "fullscreen_active" );
    }

  }
}

export default MneFullscreen
