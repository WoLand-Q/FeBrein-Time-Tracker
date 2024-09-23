<?php

namespace src;

use PDO;
use PDOException;

class Database {
    private $pdo;

    public function __construct() {
        $host = 'localhost'; // Обычно для локального сервера
        $db   = 'febtime'; // Название вашей базы данных
        $user = 'root'; // Имя пользователя MySQL
        $pass = ''; // Пароль пользователя MySQL
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Включаем исключения
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Ассоциативные массивы
            PDO::ATTR_EMULATE_PREPARES   => false,                  // Отключаем эмуляцию подготовленных выражений
        ];

        try {
            $this->pdo = new PDO($dsn, $user, $pass, $options);
        } catch (PDOException $e) {
            // Рекомендуется логировать ошибки вместо вывода их пользователю
            die('Ошибка подключения к базе данных: ' . $e->getMessage());
        }
    }

    // Получить одну запись
    public function fetch($sql, $params = []) {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }

    // Получить все записи
    public function fetchAll($sql, $params = []) {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    // Выполнить запрос (INSERT, UPDATE, DELETE)
    public function execute($sql, $params = []) {
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }
}
?>
