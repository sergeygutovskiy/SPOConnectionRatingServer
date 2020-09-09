-- MySQL dump 10.13  Distrib 8.0.21, for Linux (x86_64)
--
-- Host: localhost    Database: fspoapp_server
-- ------------------------------------------------------
-- Server version	8.0.21-0ubuntu0.20.04.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `student_id` int NOT NULL,
  `name` varchar(64) NOT NULL,
  `password` varchar(64) NOT NULL,
  `fio` varchar(128) NOT NULL,
  `party` varchar(8) NOT NULL,
  `rating_place` int NOT NULL DEFAULT '-1',
  PRIMARY KEY (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1000557,'gutovskijsergejaleksandrovich','pbaah8kc','gsa','Y2334',1),(1000617,'titovamaryanaolegovna','aake1927','tmo','Y2334',2);
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students_info`
--

DROP TABLE IF EXISTS `students_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students_info` (
  `student_id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `mid_mark` float NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `round` int NOT NULL,
  KEY `student_id` (`student_id`),
  CONSTRAINT `students_info_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students_info`
--

LOCK TABLES `students_info` WRITE;
/*!40000 ALTER TABLE `students_info` DISABLE KEYS */;
INSERT INTO `students_info` VALUES (1000557,183,0,'2020-09-09 02:53:30',0),(1000557,56,0,'2020-09-09 02:53:31',0),(1000557,53,5,'2020-09-09 02:53:32',0),(1000557,187,0,'2020-09-09 02:53:33',0),(1000557,189,0,'2020-09-09 02:53:34',0),(1000557,186,0,'2020-09-09 02:53:35',0),(1000557,67,0,'2020-09-09 02:53:36',0),(1000557,190,0,'2020-09-09 02:53:37',0),(1000557,184,0,'2020-09-09 02:53:38',0),(1000617,183,0,'2020-09-09 02:53:41',0),(1000617,56,0,'2020-09-09 02:53:42',0),(1000617,53,0,'2020-09-09 02:53:43',0),(1000617,187,0,'2020-09-09 02:53:44',0),(1000617,189,0,'2020-09-09 02:53:45',0),(1000617,186,0,'2020-09-09 02:53:46',0),(1000617,67,0,'2020-09-09 02:53:47',0),(1000617,190,0,'2020-09-09 02:53:48',0),(1000617,184,0,'2020-09-09 02:53:49',0);
/*!40000 ALTER TABLE `students_info` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-09-09  5:58:50
