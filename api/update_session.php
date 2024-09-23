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

if (!isset($data['status'])) {
    $api->errorResponse(400, 'Статус не указан');
}

$status = $data['status'];
$user_id = $api->user_id;
$date = date('Y-m-d');

// Получаем текущую сессию пользователя за сегодня
$session = $db->fetch('SELECT * FROM sessions WHERE user_id = ? AND date = ? ORDER BY id DESC LIMIT 1', [$user_id, $date]);

$allowedFields = ['status', 'start_time', 'end_time', 'lunch_start_time', 'lunch_end_time', 'total_work_time', 'total_lunch_time'];

if ($session) {
    // Обновляем существующую сессию
    $updateFields = [];
    $params = [];
    foreach ($data as $key => $value) {
        if (in_array($key, $allowedFields)) {
            $updateFields[] = "$key = ?";
            $params[] = $value;
        }
    }
    if (!empty($updateFields)) {
        $params[] = $session['id'];
        $db->execute('UPDATE sessions SET ' . implode(', ', $updateFields) . ' WHERE id = ?', $params);
    }
} else {
    // Создаём новую сессию
    $db->execute('INSERT INTO sessions (user_id, date, status, start_time) VALUES (?, ?, ?, ?)', [
        $user_id,
        $date,
        $status,
        $data['start_time'] ?? date('Y-m-d H:i:s')
    ]);
}

$api->successResponse(['message' => 'Сессия обновлена']);
?>
