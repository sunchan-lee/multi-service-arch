// MongoDB 초기화 스크립트
// 데이터베이스와 사용자 설정을 초기화합니다.

// gateway_db 데이터베이스 생성 및 사용
db = db.getSiblingDB('gateway_db');

// 사용자 생성
db.createUser({
  user: 'gateway_user',
  pwd: 'gateway_password',
  roles: [
    {
      role: 'readWrite',
      db: 'gateway_db'
    }
  ]
});

// 초기 컬렉션 생성
db.createCollection('users');
db.createCollection('tasks');

// 인덱스 생성
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.tasks.createIndex({ "user": 1 });
db.tasks.createIndex({ "createdAt": -1 });

print('MongoDB 초기화 완료');

