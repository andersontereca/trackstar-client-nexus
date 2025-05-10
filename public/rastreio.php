
<?php
header('Content-Type: application/json');

$codigo = $_GET['codigo'] ?? '';

if (!$codigo) {
    echo json_encode(['error' => 'Código de rastreamento não informado.']);
    exit;
}

$url = 'https://api-labs.wonca.com.br/wonca.labs.v1.LabsService/Track';
$data = ['code' => $codigo];
$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n" .
                     "Authorization: Apikey oW-5Hg-c_7IBLiKkOVqFEntY-FTq9YEixDy-4mEFATU",
        'method'  => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);

if (!$response) {
    echo json_encode(['error' => 'Erro ao acessar a API da Wonca.']);
    exit;
}

$apiResponse = json_decode($response, true);
$dados = json_decode($apiResponse['json'] ?? '{}', true);

$statusAtual = $dados['eventos'][0]['descricaoFrontEnd'] ?? 'Status não disponível';
$dataAtualizacao = $dados['eventos'][0]['dtHrCriado']['date'] ?? 'Data não disponível';

echo json_encode([
    'status' => $statusAtual,
    'data' => $dataAtualizacao
]);
