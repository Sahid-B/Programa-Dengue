<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['access_token'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Token de acceso obligatorio']);
        exit;
    }

    $accessToken = $data['access_token'];

    // Fetch user info from Google API using curl
    $url = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" . urlencode($accessToken);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $userInfoJson = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200 || !$userInfoJson) {
        http_response_code(400);
        echo json_encode(['error' => 'No se pudieron verificar los datos de Google']);
        exit;
    }

    $userInfo = json_decode($userInfoJson, true);
    if (empty($userInfo['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No se pudo obtener el correo de Google']);
        exit;
    }

    $correo = trim($userInfo['email']);
    $nombre = isset($userInfo['given_name']) ? trim($userInfo['given_name']) : '';
    $apellido = isset($userInfo['family_name']) ? trim($userInfo['family_name']) : '';

    // Check if user exists
    $stmt = $conn->prepare("SELECT id, nombre, apellido, correo FROM usuarios WHERE correo = ?");
    $stmt->bind_param('s', $correo);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        // Automatically register user if they don't exist
        $stmt_insert = $conn->prepare("INSERT INTO usuarios (nombre, apellido, correo, contrasena) VALUES (?, ?, ?, '')");
        $stmt_insert->bind_param('sss', $nombre, $apellido, $correo);
        $stmt_insert->execute();
        $userId = $stmt_insert->insert_id;
    } else {
        $user = $result->fetch_assoc();
        $userId = $user['id'];
        $nombre = $user['nombre'];
        $apellido = $user['apellido'];
    }

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $userId,
            'nombre' => $nombre,
            'apellido' => $apellido,
            'correo' => $correo
        ]
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>
