<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['nombre']) || empty($data['apellido']) || empty($data['correo']) || empty($data['contrasena'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Todos los campos son obligatorios']);
        exit;
    }

    $nombre = trim($data['nombre']);
    $apellido = trim($data['apellido']);
    $correo = trim($data['correo']);
    $contrasena = $data['contrasena'];

    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Formato de correo inválido']);
        exit;
    }

    $stmt_check = $conn->prepare("SELECT id FROM usuarios WHERE correo = ?");
    $stmt_check->bind_param('s', $correo);
    $stmt_check->execute();
    if ($stmt_check->get_result()->num_rows > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'El correo electrónico ya está registrado']);
        exit;
    }

    $hash_contrasena = password_hash($contrasena, PASSWORD_BCRYPT);

    $sql = "INSERT INTO usuarios (nombre, apellido, correo, contrasena) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssss', $nombre, $apellido, $correo, $hash_contrasena);

    if ($stmt->execute()) {
        $userId = $stmt->insert_id;
        echo json_encode([
            'success' => true,
            'message' => 'Usuario registrado exitosamente',
            'user' => [
                'id' => $userId,
                'nombre' => $nombre,
                'apellido' => $apellido,
                'correo' => $correo
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al registrar el usuario']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>
