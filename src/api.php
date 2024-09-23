<?php

namespace src;

require_once 'app.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Неавторизованный доступ']);
    exit();
}

header('Content-Type: application/json');

class API
{
    public int $user_id;
    public string $role;

    public function __construct()
    {
        $this->user_id = (int)$_SESSION['user_id'];
        $this->role = (string)$_SESSION['role'];
    }

    public function isPost(): bool
    {
        return $_SERVER['REQUEST_METHOD'] === 'POST';
    }

    public function isGet(): bool
    {
        return $_SERVER['REQUEST_METHOD'] === 'GET';
    }

    // Новый метод для проверки, является ли пользователь администратором
    public function isAdmin(): bool
    {
        return $this->role === 'admin'; // Проверяем роль пользователя
    }

    public function successResponse(array $data = []): void
    {
        $status = 200;
        http_response_code($status);
        $data = [
            'success' => true,
            'status' => $status,
            'data' => $data
        ];

        echo json_encode($data);
        exit();
    }

    public function errorResponse(): void
    {
        $status = 405;
        http_response_code($status);
        $data = [
            'success' => false,
            'status' => $status,
        ];

        echo json_encode($data);
        exit();
    }
}

$api = new API();

