<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Obtener la IP local de la máquina en la red
$ip = getHostByName(getHostName());

echo json_encode(['ip' => $ip]);
?>
