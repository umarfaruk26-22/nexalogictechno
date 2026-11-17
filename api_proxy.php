<?php
// High-Performance Reverse Proxy & Auto-Healer for NexaLogic IT FastAPI
$app_dir     = '/home/u121474497/domains/nexalogictechno.com/app';
$socket_path = $app_dir . '/fastapi.sock';
$runner      = $app_dir . '/run_backend.sh';
$lock_file   = $app_dir . '/.backend_boot.lock';

function is_socket_alive($sock) {
    if (!file_exists($sock)) return false;
    $fp = @fsockopen("unix://{$sock}", -1, $errno, $errstr, 0.4);
    if ($fp) {
        fclose($fp);
        return true;
    }
    return false;
}

if (!is_socket_alive($socket_path)) {
    if (!file_exists($lock_file) || (time() - filemtime($lock_file) > 10)) {
        @touch($lock_file);
        @unlink($socket_path);
        @exec("nohup bash {$runner} > /dev/null 2>&1 &");
    }
    for ($i = 0; $i < 15; $i++) {
        usleep(200000);
        if (is_socket_alive($socket_path)) {
            @unlink($lock_file);
            break;
        }
    }
}

$request_uri = $_SERVER['REQUEST_URI'];
$method      = $_SERVER['REQUEST_METHOD'];

$ch = curl_init();
curl_setopt($ch, CURLOPT_UNIX_SOCKET_PATH, $socket_path);
curl_setopt($ch, CURLOPT_URL, "http://localhost" . $request_uri);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

// Forward Headers
$forward_headers = [];
foreach (getallheaders() as $key => $value) {
    if (in_array(strtolower($key), ['host', 'content-length', 'connection'])) continue;
    $forward_headers[] = "{$key}: {$value}";
}

// Forward Request Body
if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    $body = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

if (!empty($forward_headers)) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, $forward_headers);
}

$response = curl_exec($ch);

if ($response === false) {
    http_response_code(502);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => 'Bad Gateway: Backend service unreachable',
        'curl_error' => curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

$http_code   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

$res_headers = substr($response, 0, $header_size);
$res_body    = substr($response, $header_size);

http_response_code($http_code);

foreach (explode("\r\n", $res_headers) as $h) {
    if (!empty($h) && !preg_match('/^(HTTP|Transfer-Encoding|Connection):/i', $h)) {
        header($h, false);
    }
}

echo $res_body;
