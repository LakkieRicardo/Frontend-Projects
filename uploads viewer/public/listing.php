<?php

header("Access-Control-Allow-Origin: *");

$username;
$password;
$domain_name;
$target_dir;

$ftp_conn = ftp_connect($domain_name, 21);
if (!$ftp_conn) {
    http_response_code(500);
    echo json_encode(array("error_message" => "Failed to connect to FTP server"));
    die();
}
$login_result = ftp_login($ftp_conn, $username, $password);

if (!$login_result) {
    http_response_code(500);
    echo json_encode(array("error_message" => "Failed to login to FTP server"));
    die();
}

$query_result = ftp_nlist($ftp_conn, $target_dir);
http_response_code(200);
echo json_encode(array("result" => json_encode($query_result)));

ftp_close($ftp_conn);
die();

?>