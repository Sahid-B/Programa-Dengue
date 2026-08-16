<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    if ($userId === 0) {
        echo json_encode([]);
        exit;
    }

    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $sql = "SELECT p.id, p.nombre_completo, p.edad, p.sexo, p.cedula, p.telefono,
                       p.direccion_barrio, p.enfermedad_id, e.nombre as nombre_enfermedad,
                       e.cie_10, e.color_mapa, p.nivel_gravedad, u.distrito_operativo,
                       u.unidad_operativa, p.fecha_consulta, p.latitud, p.longitud, p.observaciones
                FROM pacientes_dengue p
                JOIN catalogo_enfermedades e ON p.enfermedad_id = e.id
                LEFT JOIN catalogo_unidades_operativas u ON p.unidad_operativa_id = u.id
                WHERE p.id = ? AND p.usuario_id = ? AND p.activo = 1";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $id, $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            echo json_encode($row);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Patient not found']);
        }
        exit;
    }

    $where = "p.usuario_id = ? AND p.activo = 1";
    $params = [$userId];
    $types = "i";

    if (!empty($_GET['fecha_inicio']) && !empty($_GET['fecha_fin'])) {
        $where .= " AND p.fecha_consulta BETWEEN ? AND ?";
        $params[] = $_GET['fecha_inicio'];
        $params[] = $_GET['fecha_fin'];
        $types .= "ss";
    }

    $sql = "SELECT p.id, p.nombre_completo, p.edad, p.sexo, p.cedula, p.telefono,
                   p.direccion_barrio, p.enfermedad_id, e.nombre as nombre_enfermedad,
                   e.cie_10, e.color_mapa, p.nivel_gravedad, u.distrito_operativo,
                   u.unidad_operativa, p.fecha_consulta, p.latitud, p.longitud, p.observaciones
            FROM pacientes_dengue p
            JOIN catalogo_enfermedades e ON p.enfermedad_id = e.id
            LEFT JOIN catalogo_unidades_operativas u ON p.unidad_operativa_id = u.id
            WHERE $where
            ORDER BY p.fecha_consulta DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $pacientes = [];
    while ($row = $result->fetch_assoc()) {
        $pacientes[] = $row;
    }

    echo json_encode($pacientes);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['nombre_completo']) || empty($data['fecha_consulta']) ||
        !isset($data['latitud']) || !isset($data['longitud']) ||
        empty($data['enfermedad_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    if (!empty($data['cedula']) && !preg_match('/^[0-9]{10}$/', $data['cedula'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid cedula']);
        exit;
    }

    // Get nivel_gravedad from the selected disease
    $stmt_enfermedad = $conn->prepare("SELECT nivel_gravedad FROM catalogo_enfermedades WHERE id = ?");
    $stmt_enfermedad->bind_param('i', $data['enfermedad_id']);
    $stmt_enfermedad->execute();
    $result_enfermedad = $stmt_enfermedad->get_result();
    if ($row_enfermedad = $result_enfermedad->fetch_assoc()) {
        $nivel_gravedad = $row_enfermedad['nivel_gravedad'];
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid enfermedad_id']);
        exit;
    }

    $sql = "INSERT INTO pacientes_dengue (nombre_completo, cedula, telefono, direccion_barrio,
                                          edad, sexo, enfermedad_id, nivel_gravedad,
                                          unidad_operativa_id, fecha_consulta, latitud, longitud, observaciones, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);

    $nombre_completo = $data['nombre_completo'];
    $cedula = $data['cedula'] ?? null;
    $telefono = $data['telefono'] ?? null;
    $direccion_barrio = $data['direccion_barrio'] ?? '';
    $edad = $data['edad'] ?? 0;
    $sexo = $data['sexo'] ?? 'Otro';
    $enfermedad_id = $data['enfermedad_id'];
    $unidad_operativa_id = $data['unidad_operativa_id'] ?? null;
    $fecha_consulta = $data['fecha_consulta'];
    $latitud = $data['latitud'];
    $longitud = $data['longitud'];
    $observaciones = $data['observaciones'] ?? '';
    $usuario_id = isset($data['usuario_id']) ? intval($data['usuario_id']) : 2;

    $stmt->bind_param('ssssisisisddsi', $nombre_completo, $cedula, $telefono, $direccion_barrio,
                                     $edad, $sexo, $enfermedad_id, $nivel_gravedad,
                                     $unidad_operativa_id, $fecha_consulta, $latitud, $longitud, $observaciones, $usuario_id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'id' => $stmt->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create patient: ' . $stmt->error]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing patient id for update']);
        exit;
    }
    $id = intval($_GET['id']);

    if (empty($data['nombre_completo']) || empty($data['fecha_consulta']) ||
        !isset($data['latitud']) || !isset($data['longitud']) ||
        empty($data['enfermedad_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    if (!empty($data['cedula']) && !preg_match('/^[0-9]{10}$/', $data['cedula'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid cedula']);
        exit;
    }

    // Get nivel_gravedad from the selected disease
    $stmt_enfermedad = $conn->prepare("SELECT nivel_gravedad FROM catalogo_enfermedades WHERE id = ?");
    $stmt_enfermedad->bind_param('i', $data['enfermedad_id']);
    $stmt_enfermedad->execute();
    $result_enfermedad = $stmt_enfermedad->get_result();
    if ($row_enfermedad = $result_enfermedad->fetch_assoc()) {
        $nivel_gravedad = $row_enfermedad['nivel_gravedad'];
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid enfermedad_id']);
        exit;
    }

    $sql = "UPDATE pacientes_dengue SET nombre_completo=?, cedula=?, telefono=?, direccion_barrio=?,
                                          edad=?, sexo=?, enfermedad_id=?, nivel_gravedad=?,
                                          unidad_operativa_id=?, fecha_consulta=?, latitud=?, longitud=?, observaciones=?
            WHERE id=?";

    $stmt = $conn->prepare($sql);

    $nombre_completo = $data['nombre_completo'];
    $cedula = $data['cedula'] ?? null;
    $telefono = $data['telefono'] ?? null;
    $direccion_barrio = $data['direccion_barrio'] ?? '';
    $edad = $data['edad'] ?? 0;
    $sexo = $data['sexo'] ?? 'Otro';
    $enfermedad_id = $data['enfermedad_id'];
    $unidad_operativa_id = $data['unidad_operativa_id'] ?? null;
    $fecha_consulta = $data['fecha_consulta'];
    $latitud = $data['latitud'];
    $longitud = $data['longitud'];
    $observaciones = $data['observaciones'] ?? '';

    $stmt->bind_param('ssssisisisddsi', $nombre_completo, $cedula, $telefono, $direccion_barrio,
                                     $edad, $sexo, $enfermedad_id, $nivel_gravedad,
                                     $unidad_operativa_id, $fecha_consulta, $latitud, $longitud, $observaciones, $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update patient: ' . $stmt->error]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing patient id for deletion']);
        exit;
    }
    $id = intval($_GET['id']);
    
    $stmt = $conn->prepare("UPDATE pacientes_dengue SET activo = 0 WHERE id = ?");
    $stmt->bind_param('i', $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete patient: ' . $stmt->error]);
    }
}
?>