<?php
require 'mne_imagescale.php';
function getOrientation($file)
{
    $exif = @exif_read_data ( $file, 0, true );
    if (ISSET ( $exif ["IFD0"] ) && ISSET ( $exif ["IFD0"] ["Orientation"] )) return $exif ["IFD0"] ["Orientation"];
    return 0;
}

header ( "Content-type: " . image_type_to_mime_type ( IMAGETYPE_JPEG ) );

$xsize = 1000;
$ysize = 15;

$root = $_GET ["realpath"];
$name = $_GET ["name"];
$filesize = $_GET ["filesize"];
$fullname = $_GET ['cpath'] . "/" . $name . "." . $filesize;

if (isset ( $_GET ['x'] )) $xsize = $_GET ['x'];
if (isset ( $_GET ['y'] )) $ysize = $_GET ['y'];

$filename = $root . "/" . $name;

if (file_exists ( $filename ))
{
    if (! file_exists ( $_GET ['cpath'] ))
    {
        mkdir ( $_GET ['cpath'], 0775, true );
    }

    $mtime = filemtime ( $filename );
    $mime = mime_content_type ( $filename );

    if (strpos ( $mime, 'image' ) === 0)
    {

        $orientation = getOrientation ( $filename );

        if ($orientation == 6 || $orientation == 8)
            $size = MneImagescale ( $filename, $ysize, $xsize, $origx, $origy );
        else
            $size = MneImagescale ( $filename, $xsize, $ysize, $origx, $origy );

        switch ($size [2])
        {
            case IMAGETYPE_GIF :
                $im = imagecreatefromgif ( $filename );
                break;
            case IMAGETYPE_JPEG :
                $im = imagecreatefromjpeg ( $filename );
                break;
            case IMAGETYPE_PNG :
                $im = imagecreatefrompng ( $filename );
                break;
            case IMAGETYPE_WBMP :
                $im = imagecreatefromwbmp ( $filename );
                break;
            case IMAGETYPE_XBM :
                $im = imagecreatefromxbm ( $filename );
                break;
            default :
                return;
        }
        $newim = imagecreatetruecolor ( $size [0], $size [1] );
        imagecopyresized ( $newim, $im, 0, 0, 0, 0, $size [0] + 1, $size [1] + 1, ImagesX ( $im ), ImagesY ( $im ) );

        switch ($orientation)
        {
            case 3 :
            case 4 :
                $newim = imagerotate ( $newim, 180, 0 );
                break;
            case 5 :
            case 6 :
                $newim = imagerotate ( $newim, - 90, 0 );
                break;
            case 7 :
            case 8 :
                $newim = imagerotate ( $newim, 90, 0 );
                break;
        }

        if ($orientation == 2 || $orientation == 4 || $orientation == 5 || $orientation == 7) imageflip ( $newim, IMG_FLIP_VERTICAL );

        imagejpeg ( $newim, $fullname, 100 );
        touch ( $fullname, $mtime );
        imagedestroy ( $newim );
        imagedestroy ( $im );

    }
    elseif (strpos ( $mime, 'video' ) === 0)
    {
        $str = 'ffmpeg -i "' . $filename . '" -frames 1 -q:v 3 -vf "scale=' . $xsize . ':' . $ysize . ':force_original_aspect_ratio=decrease" -f singlejpeg "' . $fullname . '"';
        exec($str, $output );
    }
    else
    {
       exit(0);
    }

    $fp = fopen ( $fullname, 'rb' );
    if ($fp !== false)
    {
        while ( ! feof ( $fp ) )
            print (fread ( $fp, 1024 * 8 )) ;
        fclose ( $fp );
    }
    else
    {
        error_log ( $fullname . " konnte nicht geöffnet werden\n" );
    }
    exit ( 0 );
}
else
{
        exit ( 0 );
}

?>

