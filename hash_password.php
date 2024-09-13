<?php
$password = 'Rfvb15sa12'; // Замените на ваш пароль
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
echo $hashedPassword;
