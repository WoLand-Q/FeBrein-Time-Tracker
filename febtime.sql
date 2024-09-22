-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Сен 22 2024 г., 18:05
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `febtime`
--

-- --------------------------------------------------------

--
-- Структура таблицы `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `lunch_start_time` datetime DEFAULT NULL,
  `lunch_end_time` datetime DEFAULT NULL,
  `total_work_time` time DEFAULT NULL,
  `total_lunch_time` time DEFAULT NULL,
  `status` enum('working','on_lunch','not_working') DEFAULT 'not_working',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `date`, `start_time`, `end_time`, `lunch_start_time`, `lunch_end_time`, `total_work_time`, `total_lunch_time`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, '2024-09-16', '2024-09-16 16:17:20', '2024-09-16 16:18:03', '2024-09-16 16:17:27', '2024-09-16 16:17:34', '00:00:43', '00:00:06', 'working', '2024-09-16 13:17:20', '2024-09-16 13:43:21'),
(3, 4, '2024-09-16', '2024-09-16 17:11:03', '2024-09-16 17:11:38', '2024-09-16 17:11:21', '2024-09-16 17:11:25', '00:00:35', '00:00:03', 'not_working', '2024-09-16 14:11:03', '2024-09-16 14:11:38'),
(4, 6, '2024-09-16', '2024-09-17 00:21:27', '2024-09-17 00:21:27', '2024-09-17 00:20:55', '2024-09-17 00:21:27', '00:00:00', '00:00:32', 'not_working', '2024-09-16 21:11:27', '2024-09-16 21:21:27'),
(6, 6, '2024-09-22', '2024-09-22 17:19:51', '2024-09-22 17:20:09', '2024-09-22 17:20:02', '2024-09-22 16:47:34', '00:02:23', '00:00:38', 'not_working', '2024-09-22 08:00:29', '2024-09-22 14:20:10'),
(7, 2, '2024-09-22', '2024-09-22 16:23:28', '2024-09-22 16:24:03', '2024-09-22 16:23:34', '2024-09-22 16:23:48', '00:00:21', '00:00:13', 'not_working', '2024-09-22 08:58:27', '2024-09-22 13:24:03'),
(8, 4, '2024-09-22', '2024-09-22 17:13:58', '2024-09-22 17:19:22', '2024-09-22 17:15:51', '2024-09-22 16:56:32', '00:00:10', '00:00:18', 'not_working', '2024-09-22 13:48:30', '2024-09-22 14:19:23'),
(9, 7, '2024-09-22', '2024-09-22 17:28:49', '2024-09-22 17:29:57', '2024-09-22 17:29:26', '2024-09-22 17:29:42', '00:01:12', NULL, 'not_working', '2024-09-22 14:20:44', '2024-09-22 14:29:57');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `created_at`) VALUES
(2, 'Ernest', '$2y$10$hVDB1VkBCyPBpqjDzvXh0.N8c/ecR5ZG6V32A.24bgL7934S5pWtG', 'admin', '2024-09-16 13:17:15'),
(4, 'Олена', '$2y$10$hckILqqgufWjJkvH7LHbPuMwICNzRH0TjaHbt6u3V6rat.DwjbuHi', 'user', '2024-09-16 14:10:47'),
(5, 'Сергей', '$2y$10$ZCNNhpTjoCl1cshiUuwVuuco0R/yRgXzYz3U2i4fKs5zDxcigImU.', 'user', '2024-09-16 15:06:34'),
(6, 'Эрнест', '$2y$10$2eC12.CnblmWQRO6dmr1t.tANFIwJeMuTwnBq6GpZP25WrtQmVZC6', 'user', '2024-09-16 15:38:45'),
(7, 'Roman', '$2y$10$29cYFePRHomaoJU8tpGaiOXWlJBizwLiQfgaUKLovk6Kkj/Zyiz4K', 'user', '2024-09-22 08:26:20');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
