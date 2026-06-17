-- EduSphere LMS – Database Initialization
-- Runs once when the MySQL container is first created

-- Create production database
CREATE DATABASE IF NOT EXISTS `edusphere`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Ensure the app user has all privileges on edusphere DB only
GRANT ALL PRIVILEGES ON `edusphere`.* TO 'edusphere_user'@'%';

-- Read-only reporting user (optional, for analytics)
CREATE USER IF NOT EXISTS 'edusphere_readonly'@'%'
  IDENTIFIED BY 'CHANGE_ME_READONLY_PASS';
GRANT SELECT ON `edusphere`.* TO 'edusphere_readonly'@'%';

FLUSH PRIVILEGES;
