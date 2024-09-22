<?php
require_once '../src/api.php';
/** @var \src\API $api */
/** @var \src\Database $db */

if (!$api->isPost()) {
    $api->errorResponse(405, 'Метод не поддерживается');
}

// Получаем данные из тела запроса
$data = json_decode(file_get_contents('php://input'), true);

// Обработка сохранения сессии
$date = date('Y-m-d');

// Проверяем, существует ли уже запись за сегодня
$session = $db->fetch('SELECT * FROM sessions WHERE user_id = ? AND date = ?', [$api->user_id, $date]);

if ($session) {
    // Обновляем только те поля, которые были переданы в запросе
    $fieldsToUpdate = [];
    $allowedFields = ['status', 'start_time', 'end_time', 'lunch_start_time', 'lunch_end_time', 'total_work_time', 'total_lunch_time'];

    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $fieldsToUpdate[$field] = $data[$field];
        }
    }

    if (!empty($fieldsToUpdate)) {
        $setClause = implode(', ', array_map(function($key) {
            return "$key = ?";
        }, array_keys($fieldsToUpdate)));

        $params = array_values($fieldsToUpdate);
        $params[] = $session['id'];

        $db->execute("UPDATE sessions SET $setClause WHERE id = ?", $params);
    }
} else {
    // Создаем новую запись
    $db->execute('INSERT INTO sessions (user_id, date, start_time, status) VALUES (?, ?, ?, ?)', [
        $api->user_id,
        $date,
        $data['start_time'] ?? null,
        $data['status'] ?? null
    ]);
}

$api->successResponse();
?>
