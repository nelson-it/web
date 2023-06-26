//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/basic/rect.mjs
//================================================================================
'use strict';

class MneRect
{
  static in_range(value, min, max)
  {
    return (value >= min) && (value <= max);
  }

  static overlap(rect1, rect2)
  {
    return ( MneRect.in_range(rect1.x, rect2.x, rect2.x + rect2.width) || MneRect.in_range(rect2.x, rect1.x, rect1.x + rect1.width) ) 
        && ( MneRect.in_range(rect1.y, rect2.y, rect2.y + rect2.height) || MneRect.in_range(rect2.y, rect1.y, rect1.y + rect1.height));
  }
}

export default MneRect;
