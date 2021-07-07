<?php

header("Access-Control-Allow-Origin: *");

$username;
$password;
$target_dir;
$auth_password;

$ftp_conn = ftp_connect("lakkie.net", 21);
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

// Lazy brute force security fix(parallel requests will be automatically limited)
usleep(1000000);

if (!array_key_exists("auth_pswd", $_POST) or $_POST["auth_pswd"] != $auth_password) {
    http_response_code(401);
    die();
}

if ($_POST["operation"] == "delete") {
    // Super simple sanitization, may include false positives
    if (strpos($_POST["filename"], "..")) {
        http_response_code(400);
        die();
    }
    ftp_delete($ftp_conn, $target_dir . "/" . $_POST["filename"]);
    http_response_code(200);
} else if ($_POST["operation"] == "rename") {
    // Super simple sanitization, may include false positives
    if (strpos($_POST["old_name"], "..") || strpos($_POST["new_name"], "..")) {
        http_response_code(400);
        die();
    }
    ftp_rename($ftp_conn, $target_dir . "/" . $_POST["old_name"], $target_dir . "/" . $_POST["new_name"]);
    http_response_code(200);
} else {
    http_response_code(400);
    die();
}

ftp_close($ftp_conn);
die();

?>