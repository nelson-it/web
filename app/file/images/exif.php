<?php
header ( "Content-type: text/json" );

echo '{  "ids" : ["name", "value" ],';
echo '  "typs" : [ 2, 2 ],';
echo '  "labels" : ["Name", "Wert" ],';
echo '  "formats" : [ "","" ],';
echo '  "regexps" : [ "","" ],';
echo '  "values" : ';

$data = array();
if ( isset($_GET['filenameInput_old']) && $_GET ['filenameInput_old'] != 'null' && $_GET ['filenameInput_old'] != '')
{
    $file = $_GET ['root'] . '/' . $_GET ['dirInput_old'] . '/' . $_GET ['filenameInput_old'];
    $needkey = '';
    if ( isset($_GET['key']) ) $needkey = $_GET['key'];

    $exif = exif_read_data ( $file, 0, true );

    if ( $exif !== false )
    {
        foreach ( $exif as $key => $section )
        {
            foreach ( $section as $name => $val )
            {
                $val = @iconv ( mb_detect_encoding ( $val, mb_detect_order (), true ), "UTF-8", $val );
                if ($needkey == '' || $needkey == $key . "." . $name)
                {
                    array_push ( $data, array (
                            $key . '.' . $name,
                            (ctype_print ( $val )) ? $val : 'binary'
                    ) );
                }
            }
        }
    }
}

echo json_encode($data/*, JSON_PRETTY_PRINT*/);
echo '}';
