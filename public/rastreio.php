
<?php
header('Content-Type: application/json');

$codigo = $_GET['codigo'] ?? '';

if (!$codigo) {
    echo json_encode(['error' => 'Código de rastreamento não informado.']);
    exit;
}

// Simulação de resposta para testes - em produção isso viria da API real
$statuses = [
  'Objeto postado', 
  'Objeto em trânsito', 
  'Saiu para entrega', 
  'Objeto entregue ao destinatário', 
  'Aguardando retirada'
];

$status = $statuses[array_rand($statuses)];
$data = date('Y-m-d H:i:s');

echo json_encode([
    'status' => $status,
    'data' => $data
]);
