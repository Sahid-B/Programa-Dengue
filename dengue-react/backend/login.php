<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['correo']) || empty($data['contrasena'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Correo y contraseña son obligatorios']);
        exit;
    }

    $correo = trim($data['correo']);
    $contrasena = $data['contrasena'];

    $stmt = $conn->prepare("SELECT id, nombre, apellido, correo, contrasena FROM usuarios WHERE correo = ?");
    $stmt->bind_param('s', $correo);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales incorrectas']);
        exit;
    }

    $user = $result->fetch_assoc();

    if (password_verify($contrasena, $user['contrasena'])) {
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'nombre' => $user['nombre'],
                'apellido' => $user['apellido'],
                'correo' => $user['correo']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales incorrectas']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>
