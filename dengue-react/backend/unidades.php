<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT id, distrito_operativo, unidad_operativa FROM catalogo_unidades_operativas WHERE activo = 1 ORDER BY distrito_operativo, unidad_operativa";
    $result = $conn->query($sql);

    $distritos = [];
    while ($row = $result->fetch_assoc()) {
        $distrito = $row['distrito_operativo'];
        if (!isset($distritos[$distrito])) {
            $distritos[$distrito] = [
                'distrito' => $distrito,
                'unidades' => []
            ];
        }
        $distritos[$distrito]['unidades'][] = [
            'id' => $row['id'],
            'nombre' => $row['unidad_operativa']
        ];
    }

    echo json_encode(array_values($distritos));
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['distrito_operativo']) || empty($data['unidad_operativa'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    $distrito = $data['distrito_operativo'];
    $unidad = $data['unidad_operativa'];

    // Check duplicate
    $stmt_check = $conn->prepare("SELECT id FROM catalogo_unidades_operativas WHERE distrito_operativo = ? AND unidad_operativa = ?");
    $stmt_check->bind_param('ss', $distrito, $unidad);
    $stmt_check->execute();
    if ($stmt_check->get_result()->num_rows > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Esta unidad ya existe en este distrito']);
        exit;
    }

    $sql = "INSERT INTO catalogo_unidades_operativas (distrito_operativo, unidad_operativa) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ss', $distrito, $unidad);

    if ($stmt->execute()) {
        $id = $stmt->insert_id;
        echo json_encode([
            'id' => $id,
            'distrito_operativo' => $distrito,
            'unidad_operativa' => $unidad
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create unit']);
    }
}
?>