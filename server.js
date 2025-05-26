const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

// MySQL 연결 설정
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'yourpassword',  // MySQL 비밀번호
  database: 'your_database'  // 사용할 데이터베이스 이름
});

// MySQL 연결 확인
db.connect((err) => {
  if (err) {
    console.error('DB 연결 실패:', err);
    return;
  }
  console.log('DB 연결 성공');
});

const app = express();
app.use(bodyParser.json());

// 회원가입 API
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // 비밀번호 암호화
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(query, [username, hashedPassword], (err, result) => {
    if (err) {
      return res.status(500).json({ message: '회원가입 실패', error: err });
    }
    res.status(200).json({ message: '회원가입 성공' });
  });
});

// 로그인 API
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: '유저가 존재하지 않습니다.' });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: '비밀번호가 잘못되었습니다.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ message: '로그인 성공', token });
  });
});

// 서버 시작
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}에서 실행 중`);
});
