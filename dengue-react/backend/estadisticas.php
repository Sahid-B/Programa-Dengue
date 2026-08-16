<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    if ($userId === 0) {
        echo json_encode([
            'total' => 0,
            'graves' => 0,
            'normales' => 0,
            'ultimo_reporte' => null,
            'por_barrio' => [],
            'por_enfermedad' => []
        ]);
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

    $stats = [
        'total' => 0,
        'graves' => 0,
        'normales' => 0,
        'ultimo_reporte' => null,
        'por_barrio' => [],
        'por_enfermedad' => []
    ];

    // Totals and ultimo_reporte
    $sql_totals = "SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN nivel_gravedad = 'grave' THEN 1 ELSE 0 END) as graves,
                    SUM(CASE WHEN nivel_gravedad = 'normal' THEN 1 ELSE 0 END) as normales,
                    MAX(fecha_reporte) as ultimo_reporte
                   FROM pacientes_dengue p WHERE $where";

    if (!empty($params)) {
        $stmt = $conn->prepare($sql_totals);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query($sql_totals);
    }

    if ($row = $result->fetch_assoc()) {
        $stats['total'] = (int)$row['total'];
        $stats['graves'] = (int)$row['graves'];
        $stats['normales'] = (int)$row['normales'];
        $stats['ultimo_reporte'] = $row['ultimo_reporte'] ? substr($row['ultimo_reporte'], 0, 10) : null;
    }

    // Por barrio
    $sql_barrio = "SELECT direccion_barrio as barrio, COUNT(*) as total
                   FROM pacientes_dengue p
                   WHERE $where
                   GROUP BY direccion_barrio
                   ORDER BY total DESC";

    if (!empty($params)) {
        $stmt = $conn->prepare($sql_barrio);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query($sql_barrio);
    }

    while ($row = $result->fetch_assoc()) {
        $row['total'] = (int)$row['total'];
        $stats['por_barrio'][] = $row;
    }

    // Por enfermedad
    $sql_enfermedad = "SELECT e.nombre, e.color_mapa, COUNT(*) as total
                       FROM pacientes_dengue p
                       JOIN catalogo_enfermedades e ON p.enfermedad_id = e.id
                       WHERE $where
                       GROUP BY e.id, e.nombre, e.color_mapa
                       ORDER BY total DESC";

    if (!empty($params)) {
        $stmt = $conn->prepare($sql_enfermedad);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query($sql_enfermedad);
    }

    while ($row = $result->fetch_assoc()) {
        $row['total'] = (int)$row['total'];
        $stats['por_enfermedad'][] = $row;
    }

    echo json_encode($stats);
}
?>