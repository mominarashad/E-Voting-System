DROP DATABASE IF EXISTS `electronvoting`;
CREATE DATABASE `electrovoting` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `electrovoting`;


CREATE TABLE `blocks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `index_no` INT NOT NULL,
  `timestamp` VARCHAR(255) NOT NULL,
  `votes` JSON,
  `proof` INT NOT NULL,
  `previous_hash` VARCHAR(255),
  `hash` VARCHAR(255),
  PRIMARY KEY (`id`)
);

CREATE TABLE `otps` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `otp` VARCHAR(6) NOT NULL,
  `expiry` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `sessions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `voting_id` INT DEFAULT NULL,
  `role` VARCHAR(255),
  `token` VARCHAR(255),
  `created_at` DATETIME,
  `expires_at` DATETIME,
  `ip_address` VARCHAR(255),
  PRIMARY KEY (`id`)
);

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `voting_id` INT DEFAULT NULL,
  `username` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(20),
  `cnic` VARCHAR(20),
  `role` ENUM('voter','official','admin') NOT NULL,
  `is_verified` TINYINT(1) DEFAULT 0,
  `face_encoding` LONGTEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE (`voting_id`)
);

CREATE TABLE `vote_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `voting_id` VARCHAR(255),
  `ip_address` VARCHAR(255),
  `candidate` VARCHAR(255),
  `timestamp` DATETIME,
  `status` VARCHAR(50),
  `reason` TEXT,
  PRIMARY KEY (`id`)
);

CREATE TABLE `votes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `voter_hash` VARCHAR(255) NOT NULL,
  `candidate` VARCHAR(255) NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
