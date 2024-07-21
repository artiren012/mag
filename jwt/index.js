const jwt = require('jsonwebtoken');

const tokenService = {
  // 토큰 발급
  getToken(user_id) {
  // 토큰에 담을 정보, 사용할 키 (아무 값이나 가능), 토큰 옵션
    return jwt.sign({ user_id }, '7@f3gk#d9&', {
      expiresIn: '1d' // 만료시간
    });
  },
  // 토큰이 유효하다면 토큰에 담긴 정보를 반환
  getPayload(token) {
    return jwt.verify(token, '7@f3gk#d9&');
  }
}

module.exports = tokenService;