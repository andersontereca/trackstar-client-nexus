
<?php
// Set headers to allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get POST data
$postData = json_decode(file_get_contents('php://input'), true);

if (!isset($postData['code']) || !isset($postData['token'])) {
    echo json_encode(['error' => 'Código de rastreamento ou token não informado.']);
    exit;
}

$code = $postData['code'];
$token = $postData['token'];

// Make request to Wonca API
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => "https://api-labs.wonca.com.br/wonca.labs.v1.LabsService/Track",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => json_encode(['code' => $code]),
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: Apikey " . $token
    ],
]);

$response = curl_exec($ch);
$err = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

if ($err) {
    echo json_encode(['error' => 'Curl Error: ' . $err]);
    exit;
}

if ($httpCode !== 200) {
    echo json_encode(['error' => 'API Error: HTTP ' . $httpCode]);
    exit;
}

// Return the API response
echo $response;
?>
