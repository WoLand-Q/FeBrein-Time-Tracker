<?php
require_once '../src/api.php';
/** @var \src\API $api */
/** @var \src\Database $db */
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (!$api->isPost()) {
    $api->errorResponse(405, 'Метод не поддерживается');
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['session_id'])) {
    $api->errorResponse(400, 'ID сессии не указан');
}

$session_id = $data['session_id'];

// Удаляем сессию
$db->execute('DELETE FROM sessions WHERE id = ?', [$session_id]);

$api->successResponse(['message' => 'Сессия удалена']);
?>
