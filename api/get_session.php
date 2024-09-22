<?php
require_once '../src/api.php';
/** @var \src\API $api */
/** @var \src\Database $db */

if (!$api->isGet()) {
    $api->errorResponse(405, 'Метод не поддерживается');
}

$date = date('Y-m-d');

// Получаем сессию текущего пользователя за сегодняшний день
$session = $db->fetch('SELECT * FROM sessions WHERE user_id = ? AND date = ?', [$api->user_id, $date]);

if ($session) {
    $api->successResponse($session);
} else {
    $api->successResponse(null);
}
?>
