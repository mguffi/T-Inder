// db/init.js
const mysql = require('mysql2/promise');

async function initializeDatabase() {
  console.log('Starte die Datenbankinitialisierung...');
  const connection = await mysql.createConnection({
    host: '127.0.0.1', // Ändere localhost zu 127.0.0.1
    user: 'root',
    password: 'deinPasswort'
  });

  try {
    console.log('Verbindung zur MySQL-Instanz hergestellt.');

    // Datenbank erstellen, falls nicht vorhanden
    await connection.query('CREATE DATABASE IF NOT EXISTS dating_app');
    console.log('Datenbank "dating_app" erstellt oder bereits vorhanden.');

    // Datenbank auswählen
    await connection.query('USE dating_app');
    console.log('Datenbank "dating_app" ausgewählt.');

    // User-Tabelle erstellen
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        gender VARCHAR(10) NOT NULL,
        birthday DATE NOT NULL,
        image_url TEXT NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
      )
    `);
    console.log('User-Tabelle erstellt oder bereits vorhanden.');

    // Matches-Tabelle erstellen
    await connection.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        liked_user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
        FOREIGN KEY (liked_user_id) REFERENCES user(id) ON DELETE CASCADE
      )
    `);
    console.log('Matches-Tabelle erstellt oder bereits vorhanden.');

    // Filter-Tabelle erstellen
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_filters (
        user_id INT PRIMARY KEY,
        min_age INT DEFAULT 18,
        max_age INT DEFAULT 99,
        gender_preference VARCHAR(10) DEFAULT 'all',
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      )
    `);
    console.log('Filter-Tabelle erstellt oder bereits vorhanden.');

    // Testbenutzer hinzufügen
    await connection.query(`
      INSERT INTO user (id, name, gender, birthday, image_url, password_hash, password) VALUES
(1, 'John', 'male', '1995-09-17', 'https://xsgames.co/randomusers/assets/avatars/male/1.jpg', '$2b$12$DTUIgW8ZpBNyFPQIh4KVXuGzDKnmHwfCnsfaZ.O3RtUJI02nw1wii', 'password123'),
(2, 'Paul', 'male', '1992-08-04', 'https://xsgames.co/randomusers/assets/avatars/male/2.jpg', '$2b$12$ln.gPZFEj9n8/4HTMmGEreUmd2/hjOnIwZKcg6A95EssIjqzfbwxK', 'password123'),
(3, 'Mike', 'male', '1991-01-03', 'https://xsgames.co/randomusers/assets/avatars/male/3.jpg', '$2b$12$5m9BisjJJT/qWkqEu8KWhOHqovlcWX.JZig4zeXo2JdS5zjPtnZDS', 'password123'),
(4, 'David', 'male', '1979-12-07', 'https://xsgames.co/randomusers/assets/avatars/male/4.jpg', '$2b$12$0SDcBeU427EbhrDo/iu6LuMz38Ajj2gJ8T1hTECK2GlR6HTbNgnzm', 'password123'),
(5, 'James', 'male', '1993-04-14', 'https://xsgames.co/randomusers/assets/avatars/male/5.jpg', '$2b$12$4qw1A48R1u3E86tefum2y.Sd/Zft1Pbb7HIt4Fysn4r.DNZ/0L.zW', 'password123'),
(6, 'Robert', 'male', '1979-07-14', 'https://xsgames.co/randomusers/assets/avatars/male/6.jpg', '$2b$12$pgVEZLHDOBl4YCO18WJ.AOaGcWD0eFtRdX4lkdbGgtVNlBFYfxlUC', 'password123'),
(7, 'William', 'male', '1980-01-17', 'https://xsgames.co/randomusers/assets/avatars/male/7.jpg', '$2b$12$K6DGw/yoWU2Gz7DQsnA/UOKdh7joohpqskL4IPJRjIpa4brfTtcAO', 'password123'),
(8, 'Mark', 'male', '1983-01-10', 'https://xsgames.co/randomusers/assets/avatars/male/8.jpg', '$2b$12$CaUba8g.gY7C5nyO19UtX.M.M6mXjCfeewrDBk5hOpIBS0n31cpf.', 'password123'),
(9, 'Thomas', 'male', '1984-10-25', 'https://xsgames.co/randomusers/assets/avatars/male/9.jpg', '$2b$12$cVoOuKGkrwwbS4y6QVrLS.Iu5d/BnEfN413R6DtC7Xmw0Y/WZWoOi', 'password123'),
(10, 'Joseph', 'male', '1995-04-08', 'https://xsgames.co/randomusers/assets/avatars/male/10.jpg', '$2b$12$V8zY3VXccKq9Q8tYFS66rO6zdqmSTd77eJ/relWGV7hc9oWDtxvIu', 'password123'),
(11, 'Charles', 'male', '1988-12-19', 'https://xsgames.co/randomusers/assets/avatars/male/11.jpg', '$2b$12$oSIkban0L9kzzH3DdYqN0.RJEnkgOFXEt5TtXZ7Ugm054yVfYjrbi', 'password123'),
(12, 'Daniel', 'male', '1982-02-12', 'https://xsgames.co/randomusers/assets/avatars/male/12.jpg', '$2b$12$5dpQLBGlodPvs/NiyDSQG.aTW1PVcZ/bUpl6sKY5MBYRao.9IdlrS', 'password123'),
(13, 'Matthew', 'male', '1988-12-04', 'https://xsgames.co/randomusers/assets/avatars/male/13.jpg', '$2b$12$Js8lunOveEZQ3Ihmt4gv6eeLB2GAGoLkIeKdshmEaMcseTcY80PtW', 'password123'),
(14, 'Joshua', 'male', '1986-12-03', 'https://xsgames.co/randomusers/assets/avatars/male/14.jpg', '$2b$12$lUqjVYjmyuxKCnswZL7HCeF4vIWWAar9YH1ScDRHLdhgQWsMJa4KK', 'password123'),
(15, 'Ethan', 'male', '1986-09-13', 'https://xsgames.co/randomusers/assets/avatars/male/15.jpg', '$2b$12$LPm4bxK8YqoUrtwqX9ZxueNFz.TE5VS..SzqxP5qliHTwBPxkQV6a', 'password123'),
(16, 'Christopher', 'male', '1970-09-20', 'https://xsgames.co/randomusers/assets/avatars/male/16.jpg', '$2b$12$ZhBzhcZCIhGaCPX7tXwoZu485S/y7y80VZNZmGib1YC4lYlyMHWZu', 'password123'),
(17, 'Anthony', 'male', '1990-09-24', 'https://xsgames.co/randomusers/assets/avatars/male/17.jpg', '$2b$12$/tbV5YZe1A.T/VDY/uwkOueWxHKqQAi8TPuTGKBKy4Hh95cZ2NHEK', 'password123'),
(18, 'Steven', 'male', '1983-09-25', 'https://xsgames.co/randomusers/assets/avatars/male/18.jpg', '$2b$12$3nB3MNnOJaLBgxXG4Q1qH.OK7FtTQSlbdMoJ1tPoHNvmMa6Mm39oC', 'password123'),
(19, 'Andrew', 'male', '1982-10-01', 'https://xsgames.co/randomusers/assets/avatars/male/19.jpg', '$2b$12$LgE1vv7odIT3J.FaMSjT2eI5TXIATl7KpUXGiQbcVMjYxjY.gV9Ei', 'password123'),
(20, 'George', 'male', '1990-03-26', 'https://xsgames.co/randomusers/assets/avatars/male/20.jpg', '$2b$12$R/XFamqIDNXuzIECnOH/IOVgHdGckXelkDDN8S1K055GSbbRwy9yq', 'password123'),
(21, 'Kevin', 'male', '1981-09-08', 'https://xsgames.co/randomusers/assets/avatars/male/21.jpg', '$2b$12$oUD/rpr6CR.V4Lv1FPBlIuVtGUBZtLQ24U.sx7i5EHKMwTFws01sO', 'password123'),
(22, 'Brian', 'male', '1978-01-21', 'https://xsgames.co/randomusers/assets/avatars/male/22.jpg', '$2b$12$sopKHTNYKoFvmU/XwV2.EOI//szw52glKlkZ6drA5XDBHu9L2BZBC', 'password123'),
(23, 'Aaron', 'male', '1998-10-18', 'https://xsgames.co/randomusers/assets/avatars/male/23.jpg', '$2b$12$Q3y5DUx.F8RRl5UTVkc.O.ekuIekOBmisPdRFY3ixn5X5mIQQSYeO', 'password123'),
(24, 'Henry', 'male', '1980-01-02', 'https://xsgames.co/randomusers/assets/avatars/male/24.jpg', '$2b$12$Wmo4csmFxRoY8WbBmGpKsuO1DzX84YUMlQCSiOeyQdsI0gPZSeoi2', 'password123'),
(25, 'Jack', 'male', '1995-03-06', 'https://xsgames.co/randomusers/assets/avatars/male/25.jpg', '$2b$12$sIUCE4Qc0OegTMrG8T3axOsOwTiyRyHcVdTACu6Ci7/5sA0j9H8AS', 'password123'),
(26, 'Samuel', 'male', '1991-04-03', 'https://xsgames.co/randomusers/assets/avatars/male/26.jpg', '$2b$12$fNKQTiomkMJYzaxGTKr0ZeKKpuSBgv9M9MaCA5XnDFTa4Jan03.M6', 'password123'),
(27, 'David', 'male', '1994-03-24', 'https://xsgames.co/randomusers/assets/avatars/male/27.jpg', '$2b$12$S7VxmVJbMQ4RNzW1FpB2W.CJui/0zKSnUodRkh3S.Km048pH8hEdy', 'password123'),
(28, 'Richard', 'male', '1985-02-24', 'https://xsgames.co/randomusers/assets/avatars/male/28.jpg', '$2b$12$axznjQTMkmLDctQidXXth.00mF.tGH7.ZeGaD9Wc9Ugsd5gwqfEBm', 'password123'),
(29, 'Benjamin', 'male', '1999-04-03', 'https://xsgames.co/randomusers/assets/avatars/male/29.jpg', '$2b$12$frOMdkiKcU.wh8F9f0RaxuBeHFHtwsqIuZraO3YVn6fs6I/yFUGf.', 'password123'),
(30, 'David', 'male', '1992-11-04', 'https://xsgames.co/randomusers/assets/avatars/male/30.jpg', '$2b$12$2RUV6kYuUhwkb4lH2ltq7OiyuF4HDLTFbgDHKknYh5Ibnt4ZnU2AW', 'password123'),
(31, 'Mary', 'female', '1986-02-12', 'https://xsgames.co/randomusers/assets/avatars/female/1.jpg', '$2b$12$bDaS7eslm2ag8SAzNYBSJujw/ytN/fVGcgLABBvb9yeEE5gIqd7H6', 'password123'),
(32, 'Jennifer', 'female', '2000-10-18', 'https://xsgames.co/randomusers/assets/avatars/female/2.jpg', '$2b$12$SMCTjCFm4MBO5Qaa7xKFA.CVR0FDlWFUO4xELbLnZsG/AyMIt3XwG', 'password123'),
(33, 'Linda', 'female', '1998-10-26', 'https://xsgames.co/randomusers/assets/avatars/female/3.jpg', '$2b$12$mDqB0epBvw4hheqj197klO4Ijlbf64iq.z7qDSlWd15KHTb/JFJKe', 'password123'),
(34, 'Patricia', 'female', '1990-02-04', 'https://xsgames.co/randomusers/assets/avatars/female/4.jpg', '$2b$12$dzbbsgJe7j/7AHnJ3kbRJ.bV7qUFs/vQobkRI7yHzj7o35e5RJ9SW', 'password123'),
(35, 'Elizabeth', 'female', '1989-09-14', 'https://xsgames.co/randomusers/assets/avatars/female/5.jpg', '$2b$12$Y3hsm1rn/LpA/XvcdZnscOvAynBEMlwhCVhh4hwfHCJ7dw.q9Jkji', 'password123'),
(36, 'Susan', 'female', '1972-01-18', 'https://xsgames.co/randomusers/assets/avatars/female/6.jpg', '$2b$12$tnOvsUi1WCG5jotNpWhoM.aRsIVJsMIlEcNPnhBOF1wCX2K/IZE6i', 'password123'),
(37, 'Jessica', 'female', '1972-03-21', 'https://xsgames.co/randomusers/assets/avatars/female/7.jpg', '$2b$12$nJ3F/0lLYc08XTw6yDusU.gwJZ6YbNkCo4oUqRuSg41.t.JHUfG0S', 'password123'),
(38, 'Sarah', 'female', '1976-12-27', 'https://xsgames.co/randomusers/assets/avatars/female/8.jpg', '$2b$12$yBO6e9xFtoUgblBcCOIhP.30p3Y/X/EfIgEpaQZq5H7LvvN8lNtuS', 'password123'),
(39, 'Karen', 'female', '1985-01-01', 'https://xsgames.co/randomusers/assets/avatars/female/9.jpg', '$2b$12$EhCy4N/620JCpNVv/Xb2veXQP50K11sieHenwdxyKedbSVf1M4y0W', 'password123'),
(40, 'Nancy', 'female', '1973-06-14', 'https://xsgames.co/randomusers/assets/avatars/female/10.jpg', '$2b$12$IghEKtwW7HTHlJQRKekVnef3Ncenapkcql4Kb6cW0Zsl17AvPw7ha', 'password123'),
(41, 'Lisa', 'female', '1975-11-22', 'https://xsgames.co/randomusers/assets/avatars/female/11.jpg', '$2b$12$jA4ExaMA9zXRAlYJrXcJiOHyhdkWByeES7CtjKcjtO3LkPnF6t1Za', 'password123'),
(42, 'Betty', 'female', '1972-11-14', 'https://xsgames.co/randomusers/assets/avatars/female/12.jpg', '$2b$12$t1pJEBbMyc3/./xtBA.3YO4sM7ZsVW10C9X1MtPDkm.Ny/hDCc8T2', 'password123'),
(43, 'Helen', 'female', '1998-10-26', 'https://xsgames.co/randomusers/assets/avatars/female/13.jpg', '$2b$12$0sE7p7dIiP5tgRh/RX.Yz.ya39PLagxb87ATTEal5kxeE6dJwku9a', 'password123'),
(44, 'Sandra', 'female', '1996-01-03', 'https://xsgames.co/randomusers/assets/avatars/female/14.jpg', '$2b$12$/QOuLPLnSGS9eNgWvP4HbelBY9t31d/xwXcw0aOxX807f6s5EEB8e', 'password123'),
(45, 'Ashley', 'female', '1972-01-14', 'https://xsgames.co/randomusers/assets/avatars/female/15.jpg', '$2b$12$nbDyLtdeTNK64JrrnnSx2Or0aqT8yEpD3NqInKCDDqOg0WVm5tSWW', 'password123'),
(46, 'Dorothy', 'female', '1999-11-11', 'https://xsgames.co/randomusers/assets/avatars/female/16.jpg', '$2b$12$DwlN3hWjUSmetLsC3aippeeAUNM.Zze7uBjSUCRh9u.AQfWu51Emu', 'password123'),
(47, 'Ruth', 'female', '1992-10-02', 'https://xsgames.co/randomusers/assets/avatars/female/17.jpg', '$2b$12$HWy8TXANTTp0Q64YHc09B.Fm/DisaLEgOQv9MDDno.x9A6g3tbuDi', 'password123'),
(48, 'Sharon', 'female', '1970-08-23', 'https://xsgames.co/randomusers/assets/avatars/female/18.jpg', '$2b$12$h00pKz71Llc9HVcFmKUvEeFkN7AJQVjk14tyoDFudj7T/qLOt3lbW', 'password123'),
(49, 'Cynthia', 'female', '1994-11-18', 'https://xsgames.co/randomusers/assets/avatars/female/19.jpg', '$2b$12$ffkXkbreh9PH2aT0AAgnG.9GBvl1pnPSDvrfhPwMJfJ8Z4MYONM0i', 'password123'),
(50, 'Angela', 'female', '1987-10-24', 'https://xsgames.co/randomusers/assets/avatars/female/20.jpg', '$2b$12$d6sh/1nkAB4K8Aa67W3FOO/ElazDOys6osYsVgFUrGUspX2FQC8KC', 'password123'),
(51, 'Margaret', 'female', '1981-07-28', 'https://xsgames.co/randomusers/assets/avatars/female/21.jpg', '$2b$12$h1SHdAwpBHu6fu74EbZBQe4gcAdVC6nhDUAZBexOsrNKI2dOEJNRa', 'password123'),
(52, 'Marie', 'female', '1980-01-23', 'https://xsgames.co/randomusers/assets/avatars/female/22.jpg', '$2b$12$ctpLcRra613g6O95QjWXEu89.VCfftx.kg/CEhvvO.ZhYLz3wTVVu', 'password123'),
(53, 'Carol', 'female', '1983-12-13', 'https://xsgames.co/randomusers/assets/avatars/female/23.jpg', '$2b$12$QTiWiHVe4sXlO3XtW2kPG.Ew6oT6FhWU8kbIybpjMwgJ5s6SLrB0y', 'password123'),
(54, 'Michelle', 'female', '1994-01-26', 'https://xsgames.co/randomusers/assets/avatars/female/24.jpg', '$2b$12$v9SZeESurIzk0Z0IzFZR6ueBfgluLF/eWsxmQCqsD3DOZNCb5AE4u', 'password123'),
(55, 'Dorothy', 'female', '1997-07-19', 'https://xsgames.co/randomusers/assets/avatars/female/25.jpg', '$2b$12$9ImUrYMldImiaabQfwnPR.WYim2Fp.rAueGQpOrMkfohYQ9ODtHn.', 'password123'),
(56, 'Amy', 'female', '1994-03-28', 'https://xsgames.co/randomusers/assets/avatars/female/26.jpg', '$2b$12$D.UQaHYV/dCGIqOdvSZKCe.ywGzC3Bz7eYv12XPf2I46FvT0yFCqS', 'password123'),
(57, 'Emily', 'female', '1970-02-17', 'https://xsgames.co/randomusers/assets/avatars/female/27.jpg', '$2b$12$N3rW7P3P6UuhjOfKj6V8sOnyjjtymE5bJwwTNTNaqfGnNdF.cDAFG', 'password123'),
(58, 'Joan', 'female', '1979-08-22', 'https://xsgames.co/randomusers/assets/avatars/female/28.jpg', '$2b$12$fjrqafNYEUnOACGXDYrADO7zXKl5FX9vzhcYe4iXJH4F3gbwtDuvW', 'password123'),
(59, 'Martha', 'female', '1997-07-13', 'https://xsgames.co/randomusers/assets/avatars/female/29.jpg', '$2b$12$OG77W/Ehzdto2F5XgzdFrOm/XILQZG0./kLcMbJkUJsoow0kR1eWu', 'password123'),
(60, 'Grace', 'female', '1993-05-07', 'https://xsgames.co/randomusers/assets/avatars/female/30.jpg', '$2b$12$0y8aGqJ2pgojq0KYkdq.c.Bc7W2LoyWJWWlDblpWCMqJZ99Dl53gK', 'password123');


    `);
    console.log('Testbenutzer hinzugefügt.');
  } catch (error) {
    console.error('Fehler bei der Datenbankinitialisierung:', error);
  } finally {
    await connection.end();
    console.log('Datenbankverbindung geschlossen.');
  }
}

// Führe die Initialisierung aus
initializeDatabase();

module.exports = initializeDatabase;
