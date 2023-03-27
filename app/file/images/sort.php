<?php
header ( "Content-type: text/json" );

require 'mne_errorhandler.php';

$format = $_GET ['formatInput'];
if ($format == '') $format = "Bild%'04d";

$dir1 = $_GET ['root'] . '/' . $_GET ['dirInput_old'];
if ($dir1 [strlen ( $dir1 ) - 1] != '/') $dir1 = $dir1 . '/';

$files=[];
for($i = 0; isset ( $_GET ['pic' . $i . 'Input_old'] ); $i ++)
{
    $files[$_GET ['pic' . $i . 'Input_old'] ] = $i;
}

foreach ( scandir ( $dir1 ) as $i )
{
    if ($i == '.' || $i == '..') continue;
    if ( isset($files[$i]) ) continue;
    trigger_error("Nicht für alle Dateien ein Sortiereintrag: " . $i, E_USER_ERROR);
}
    
$i=0;
$dir2 = $dir1 . 'mne_sort_' . $i . '/';
while (file_exists ( $dir2 ))
{
    $i++;
    $dir2 = $dir1 . 'mne_sort_' . $i . '/';
}
mkdir ( $dir2, 0775, true );

foreach ( scandir ( $dir1 ) as $i )
{
    if ($i == '.' || $i == '..' || str_starts_with($i, 'mne_sort_')) continue;
    rename($dir1 . $i, $dir2 . $i );
}


$format = $format . ".%s";

for($i = 0; isset ( $_GET ['pic' . $i . 'Input_old'] ); $i ++)
{
    $file1 = $_GET ['pic' . $i . 'Input_old'];
    $f = explode ( '.', $file1 );
    $ftyp = strtolower ( array_pop ( $f ) );

    $file2 = sprintf ( $format, $i, $ftyp );

    if (file_exists ( $dir1 . $file2 ) )
        trigger_error("Datei existiert schon: " . $$dir1 . $file2, E_USER_ERROR);
    rename( $dir2 . $file1, $dir1 . $file2 );
}

rmdir ( $dir2 );

echo '{ "result" : "ok" }';
exit ( 0 );
?>