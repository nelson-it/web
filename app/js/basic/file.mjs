//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/basic/file.mjs
//================================================================================
'use strict';

export class MneFile
{
  static magics = [
  {
    magic: new Uint8Array([0xff, 0xd8, 0xff]),
    filetyp: 'jpg',
    mime: 'image/jpg',
  },
  {
    magic: new Uint8Array([0x42, 0x4d]),
    filetyp: 'bmp',
    mime: 'image/bmp',
  },
  {
    magic: new Uint8Array([0x47, 0x49, 0x46, 0x38]),
    filetyp: 'gif',
    mime: 'image/gif',
  },
  {
    magic: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
    filetyp: 'png',
    mime: 'image/png',
  },
  {
    magic: new Uint8Array([0x4d, 0x4d, 0x00, 0x2a]),
    filetyp: 'tif',
    mime: 'image/tiff',
  },
  {
    magic: new Uint8Array([0x49, 0x49, 0x2a, 0x00]),
    filetyp: 'tif',
    mime: 'image/tiff',
  },
  {
    magic: new Uint8Array([0x49, 0x20, 0x49]),
    filetyp: 'tif',
    mime: 'image/tiff',
  },
  {
    magic: new Uint8Array([0x00, 0x00, 0x01, 0x00]),
    filetyp: "ico",
    mime: "image/x-icon",
  },
  {
    magic: new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61, 0x47, 0x49, 0x46, 0x38, 0x39, 0x61]),
    filetyp: "gif",
    mime: "image/gif",
  },
  {
    magic: new Uint8Array([0x49, 0x49, 0x2A, 0x00, 0x4D, 0x4D, 0x00, 0x2A]),
    filetyp: "tif",
    mime: "image/tiff",
  },
  {
    magic: new Uint8Array([0x4D, 0x5A]),
    filetyp : "exe",
    mime : "application/x-msdownload",
  },
  {
    magic: new Uint8Array([0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x00]),
    filetyp: "rar",
    mime : "application/x-rar-compressed",
  },
  {
    magic: new Uint8Array([0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x01, 0x00]),
    filetyp: "rar",
    mime: "application/x-rar-compressed",
  },
  {
    magic: new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    filetyp: "png",
    mime : "image/png",
  },
  {
    magic: new Uint8Array([0xCA, 0xFE, 0xBA, 0xBE]),
    filetyp: "class",
    mime :"application/java-vm",
  },
  {
    magic: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
    filetyp: "pdf",
    mime: "application/pdf",
  },
  {
    magic: new Uint8Array([0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9, 0x00, 0xAA, 0x00, 0x62, 0xCE, 0x6C]),
    filetyp: "asf",
    mime: "video/x-ms-asf",
  },
  {
    magic :new Uint8Array([0x4F, 0x67, 0x67, 0x53]),
    filetyp: "ogg",
    mime: "audio/ogg",
  },
  {
    magic: new Uint8Array([0x38, 0x42, 0x50, 0x53]),
    filetyp: "psd",
    mime: "image/vnd.adobe.photoshop",
  },
  {
    magic: new Uint8Array([0xFF, 0xFB]),
    filetyp: "mp3",
    mime: "audio/mpeg",
  },
  {
    magic: new Uint8Array([0x49, 0x44, 0x33]),
    filetyp: "mp3",
    mime: "audio/mpeg",
  },
  {
    magic: new Uint8Array([0x42, 0x4D]),
    filetyp: "bmp",
    mime: "image/bmp",
  },
  {
    magic : new Uint8Array([0x43, 0x44, 0x30, 0x30, 0x31]),
    filetyp: "iso",
    mime: "application/x-iso9660-image",
  },
  {
    magic: new Uint8Array([0x66, 0x4C, 0x61, 0x43]),
    filetyp: "flac",
    mime: "audio/x-flac",
  },
  {
    magic: new Uint8Array([0x00, 0x00, 0x01, 0xBA]),
    filetyp: "mpg",
    mime: "video/mpeg",
  },
  {
    magic: new Uint8Array([0x00, 0x00, 0x01, 0xBA]),
    filetyp: "mpeg",
    mime: "video/mpeg",
  },
  {
    offset: 4,
    magic: new Uint8Array([0x66, 0x74, 0x79, 0x70]),
    filetyp: "mp4",
    mime: "video/mp4",
  },
  {
    offset: 4,
    magic: new Uint8Array([0x66, 0x74, 0x79, 0x70, 0x6D]),
    filetyp: "mp4",
    mime: "video/mp4",
  },
  {
    magic: new Uint8Array([0x4F, 0x67, 0x67, 0x53]),
    filetyp: "ogg",
    mime: "application/ogg",
  },
  {
    magic: new Uint8Array([0x4F, 0x67, 0x67, 0x53]),
    filetyp: "oga",
    mime: "audio/ogg",
  },
  {
    magic: new Uint8Array([0x4F, 0x67, 0x67, 0x53]),
    filetyp: "ogv",
    mime: "video/ogg",
  },
  ];
  
  static filetyps = {};
  static maxsize = 0;
  
  static check_ft( m, ft )
  {
    var magics  = ( MneFile.filetyps[ft] ) ? MneFile.filetyps[ft].magics : undefined;
    var offsets = ( MneFile.filetyps[ft] ) ? MneFile.filetyps[ft].offsets : undefined;
    var i,n;

    if ( ! magics ) return false;
    
    for ( i=0; i<magics.length; i++ )
    {
      var offset = offsets[i];
      for(n=0; n<magics[i].length && n < m.length && magics[i][n] == m[n + offset]; n++ );
      if ( n == magics[i].length ) return MneFile.filetyps[ft].mime;
    }
    
    return false;
  }
  
  static check( m, ft )
  {
    var result;
    var i;
    
    if ( !m.length || m.length > MneFile.maxsize ) return 'application/octet-stream';
    if ( ( result = MneFile.check_ft(m, ft)) !== false ) return result;
    
    for ( i =0; i<MneFile.magics.length; i++) 
      if ( MneFile.magics[i].magic.length && ( result = MneFile.check_ft(m, MneFile.magics[i].filetyp)) !== false ) return result;
    
    return 'application/octet-stream';
  }
}


MneFile.magics.forEach( item =>
{
  item.offset = item.offset ?? 0;
  MneFile.maxsize = ( MneFile.maxsize < item.magic.length + ( item.offset ) ) ?  item.magic.length  + ( item.offset ): MneFile.maxsize;

  if ( MneFile.filetyps[item.filetyp] )
  {
    MneFile.filetyps[item.filetyp].magics.push(item.magic);
    MneFile.filetyps[item.filetyp].offsets.push(item.offset);
    
  }
  else
  {
    MneFile.filetyps[item.filetyp] = { magics : [ item.magic ], mime : item.mime, offsets : [ item.offset ] };
  }
});

//Object.keys(MneFile.filetyps).forEach( item => console.log(MneFile.filetyps[item].mime))

export default MneFile;
