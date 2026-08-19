<?php
// Función para cargar variables de entorno desde un archivo .env
function cargarEnv($path) {
    if (!file_exists($path)) {
        return;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue; // Omitir comentarios
        }
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $name = trim($parts[0]);
            $value = trim($parts[1]);
            
            // Eliminar comillas si las hay
            $value = trim($value, '"\'');
            
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv("{$name}={$value}");
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

// Cargar el archivo .env ubicado en la misma carpeta que db.php
cargarEnv(__DIR__ . '/.env');

$url = getenv('TURSO_DATABASE_URL') ?: 'https://dbdengue-sahid-bv.aws-us-east-1.turso.io';
$token = getenv('TURSO_AUTH_TOKEN') ?: '';

class TursoConnection {
    private $url;
    private $token;
    public $insert_id = 0;
    public $error = '';

    public function __construct($url, $token) {
        $this->url = str_replace('libsql://', 'https://', $url);
        $this->url = rtrim($this->url, '/');
        $this->token = $token;
    }

    public function set_charset($charset) {
        return true;
    }

    public function query($sql) {
        $stmt = $this->prepare($sql);
        if (!$stmt) return false;
        if (!$stmt->execute()) return false;
        return $stmt->get_result();
    }

    public function prepare($sql) {
        return new TursoStatement($this->url, $this->token, $sql, $this);
    }
}

class TursoStatement {
    private $url;
    private $token;
    private $sql;
    private $params = [];
    private $conn;
    private $resultData = null;
    public $error = '';
    public $insert_id = 0;

    public function __construct($url, $token, $sql, $conn) {
        $this->url = $url;
        $this->token = $token;
        $this->sql = $sql;
        $this->conn = $conn;
    }

    public function bind_param($types, &...$params) {
        $this->params = [];
        for ($i = 0; $i < strlen($types); $i++) {
            $t = $types[$i];
            $val = $params[$i];
            
            if ($val === null) {
                $this->params[] = ['type' => 'null', 'value' => null];
            } else if ($t === 'i') {
                $this->params[] = ['type' => 'integer', 'value' => (string)$val];
            } else if ($t === 'd') {
                $this->params[] = ['type' => 'float', 'value' => (float)$val];
            } else {
                $this->params[] = ['type' => 'text', 'value' => (string)$val];
            }
        }
        return true;
    }

    public function execute() {
        $args = [];
        foreach ($this->params as $p) {
            $args[] = $p;
        }

        $payload = [
            'requests' => [
                [
                    'type' => 'execute',
                    'stmt' => [
                        'sql' => $this->sql,
                        'args' => $args
                    ]
                ],
                [
                    'type' => 'close'
                ]
            ]
        ];

        $ch = curl_init($this->url . '/v2/pipeline');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->token,
            'Content-Type: application/json'
        ]);

        $res = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            $this->error = "Turso HTTP Error: $httpCode. Response: $res";
            $this->conn->error = $this->error;
            return false;
        }

        $data = json_decode($res, true);
        if (!$data || !isset($data['results'][0])) {
            $this->error = "Invalid JSON response from Turso";
            $this->conn->error = $this->error;
            return false;
        }

        $firstResult = $data['results'][0];
        if ($firstResult['type'] === 'error') {
            $this->error = $firstResult['error']['message'];
            $this->conn->error = $this->error;
            return false;
        }

        $executeResult = $firstResult['response']['result'] ?? null;
        if (!$executeResult) {
            $this->error = "No execute result returned";
            $this->conn->error = $this->error;
            return false;
        }

        $this->resultData = $executeResult;
        
        if (isset($executeResult['last_insert_rowid'])) {
            $this->insert_id = intval($executeResult['last_insert_rowid']);
            $this->conn->insert_id = $this->insert_id;
        }
        
        return true;
    }

    public function get_result() {
        if (!$this->resultData) return false;
        return new TursoResult($this->resultData);
    }
}

class TursoResult {
    private $cols = [];
    private $rows = [];
    private $currentIndex = 0;
    public $num_rows = 0;

    public function __construct($data) {
        $this->cols = $data['cols'] ?? [];
        $rawRows = $data['rows'] ?? [];
        
        foreach ($rawRows as $rawRow) {
            $row = [];
            foreach ($rawRow as $colIndex => $valObj) {
                $colName = $this->cols[$colIndex]['name'] ?? $colIndex;
                $row[$colName] = $valObj['value'] ?? null;
            }
            $this->rows[] = $row;
        }
        
        $this->num_rows = count($this->rows);
    }

    public function fetch_assoc() {
        if ($this->currentIndex >= $this->num_rows) {
            return null;
        }
        return $this->rows[$this->currentIndex++];
    }
}

// Inicializar conexión global
$conn = new TursoConnection($url, $token);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
