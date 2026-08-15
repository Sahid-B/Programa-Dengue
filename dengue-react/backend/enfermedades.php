<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT id, nombre, cie_10, color_mapa, nivel_gravedad FROM catalogo_enfermedades WHERE activo = 1 ORDER BY nombre";
    $result = $conn->query($sql);

    $enfermedades = [];
    while ($row = $result->fetch_assoc()) {
        $enfermedades[] = $row;
    }

    echo json_encode($enfermedades);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['nombre']) || empty($data['color_mapa'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    if (!preg_match('/^#[0-9a-fA-F]{6}$/', $data['color_mapa'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid color_mapa format']);
        exit;
    }

    $nombre = $data['nombre'];
    $cie_10 = $data['cie_10'] ?? null;
    $color_mapa = $data['color_mapa'];
    $nivel_gravedad = $data['nivel_gravedad'] ?? 'normal';

    $sql = "INSERT INTO catalogo_enfermedades (nombre, cie_10, color_mapa, nivel_gravedad) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssss', $nombre, $cie_10, $color_mapa, $nivel_gravedad);

    if ($stmt->execute()) {
        echo json_encode([
            'id' => $stmt->insert_id,
            'nombre' => $nombre,
            'cie_10' => $cie_10,
            'color_mapa' => $color_mapa,
            'nivel_gravedad' => $nivel_gravedad
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create enfermedad']);
    }
}
?>