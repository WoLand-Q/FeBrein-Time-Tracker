<?php
session_start();
require 'db.php';

$db = new Database();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Неавторизованный доступ']);
    exit();
}

$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'];

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Получаем данные из тела запроса
    $data = json_decode(file_get_contents('php://input'), true);

    // Обработка сохранения сессии
    $date = date('Y-m-d');

    // Проверяем, существует ли уже запись за сегодня
    $session = $db->fetch('SELECT * FROM sessions WHERE user_id = ? AND date = ?', [$user_id, $date]);

    if ($session) {
        // Обновляем существующую запись
        $db->execute('UPDATE sessions SET start_time = ?, end_time = ?, lunch_start_time = ?, lunch_end_time = ?, total_work_time = ?, total_lunch_time = ?, status = ? WHERE id = ?', [
            array_key_exists('start_time', $data) ? $data['start_time'] : $session['start_time'],
            array_key_exists('end_time', $data) ? $data['end_time'] : $session['end_time'],
            array_key_exists('lunch_start_time', $data) ? $data['lunch_start_time'] : $session['lunch_start_time'],
            array_key_exists('lunch_end_time', $data) ? $data['lunch_end_time'] : $session['lunch_end_time'],
            array_key_exists('total_work_time', $data) ? $data['total_work_time'] : $session['total_work_time'],
            array_key_exists('total_lunch_time', $data) ? $data['total_lunch_time'] : $session['total_lunch_time'],
            array_key_exists('status', $data) ? $data['status'] : $session['status'],
            $session['id']
        ]);
    } else {
        // Создаем новую запись
        $db->execute('INSERT INTO sessions (user_id, date, start_time, status) VALUES (?, ?, ?, ?)', [
            $user_id,
            $date,
            $data['start_time'],
            $data['status']
        ]);
    }

    echo json_encode(['success' => true]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Обработка получения данных

    $date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

    if ($role === 'admin') {
        // Администратор может видеть данные всех пользователей за выбранную дату
        $sessions = $db->fetchAll('SELECT s.*, u.username FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.date = ?', [$date]);
        echo json_encode($sessions);
    } else {
        // Обычный пользователь видит только свои данные
        $session = $db->fetch('SELECT s.*, u.username FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.user_id = ? AND s.date = ?', [$user_id, $date]);
        if ($session) {
            echo json_encode([$session]); // Возвращаем массив с одной сессией
        } else {
            echo json_encode([]); // Возвращаем пустой массив
        }
    }
}
?>
