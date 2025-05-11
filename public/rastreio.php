
<?php
// Set headers to allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get input data from POST or GET
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postData = json_decode(file_get_contents('php://input'), true);
    $code = $postData['code'] ?? '';
    $token = $postData['token'] ?? 'oW-5Hg-c_7IBLiKkOVqFEntY-FTq9YEixDy-4mEFATU';
} else {
    $code = $_GET['codigo'] ?? '';
    $token = $_GET['token'] ?? 'oW-5Hg-c_7IBLiKkOVqFEntY-FTq9YEixDy-4mEFATU';
}

// Validate input
if (!$code) {
    echo json_encode(['error' => 'Código de rastreamento não informado.']);
    exit;
}

// Make API request using stream context (native PHP approach)
$url = 'https://api-labs.wonca.com.br/wonca.labs.v1.LabsService/Track';
$data = ['code' => $code];

$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n" .
                     "Authorization: Apikey " . $token,
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true
    ]
];

$context = stream_context_create($options);
$response = @file_get_contents($url, false, $context);

// Check for errors
if ($response === false) {
    echo json_encode(['error' => 'Erro ao acessar a API da Wonca.']);
    exit;
}

// Return the API response
echo json_encode(['json' => $response]);
?>
