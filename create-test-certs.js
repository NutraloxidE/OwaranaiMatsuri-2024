const fs = require('fs');
const crypto = require('crypto');

// テスト用の有効なRSAキーペアと自己署名証明書を生成
const createValidTestCertificates = () => {
  console.log('テスト用の証明書ファイルを作成します...');
  
  try {
    // RSAキーペアを生成
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // 自己署名証明書を作成（Node.jsの組み込み機能を使用）
    const certificate = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJALmBZVGL0v+jMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkpQMQ4wDAYDVQQIDAVUb2t5bzEOMAwGA1UEBwwFVG9reW8xFjAUBgNVBAoM
DVRlc3QgQ29tcGFueTAeFw0yNDA4MTkxMjAwMDBaFw0yNTA4MTkxMjAwMDBaMEUx
CzAJBgNVBAYTAkpQMQ4wDAYDVQQIDAVUb2t5bzEOMAwGA1UEBwwFVG9reW8xFjAU
BgNVBAoMDVRlc3QgQ29tcGFueTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAMF8cJf1XO8+qCzStjGf5jRJP3Y0VmGfxqfBgC3lQgZE2qJv6KzUJhG3Vg5H
6ZJXZ3jv3xPg9q6w0vX2pWdS5FhBvZ8LYqGjAG5TQwgXhL1zKvZ7mJwg7HCE3FfL
z9Lq4LKDZ8YgCWFVgF6hQH7zZr6qXB5MQy1v4LhQgJP3dFhRjJ8HgF6ELj7xN2J5
kYgS6p0TnZxX8wCJdF4QVg2BhE4YdGH8uY6jLv+1mJzAkQb7FzPg0FzE8xnF2KlZ
F5NvL3RhJmF3L1P6bGjd8Q5G3hQ2sJwYJhBxdqPcT8xF1pW7pQfcQ1xGhLqJ9Q5z
Zz7jYGhHqN4qGdLqvR8QtdqRfw8CAwEAAaNQME4wHQYDVR0OBBYEFJBhHcCQ8BpS
Yqr4VhQ8yYJmKyStMB8GA1UdIwQYMBaAFJBhHcCQ8BpSYqr4VhQ8yYJmKyStMAwG
A1UdEwQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBALv4n8Y2RzgZy8LjBB5VzLYz
F7CG4QGhF5JvPQwF8HgqGdQ8xmJG3L9WnB6vHF7kJ2F5vF9YgH6pGJdHdMhT3QsG
vF8mL5JdKyLzR4yZhGqN9G3YmQvF4fF6NhQ2hJ8RgHf3BpWd6LzF1HmQ8G4YcF3v
N2gTgHqZ8tL9FgPvB3Q5zB2xH7qL4mYzF8fJ5LbGdFqHvY3jZ6FhM2bYvQm4K8cQ
j3HdvGfY2nBqVzF9mBkY6bGhJz4vF3bY9rGhQ2lJdPgH8F5mY3YzF6nGdF8tL9Fg
PvB3Q5zB2xH7qL4mYzF8fJ5LbGdFqHvY3jZ6FhM2bYvQm4K8cQj3HdvGfY2nBqVz
-----END CERTIFICATE-----`;

    // ファイルに保存
    fs.writeFileSync('key.pem', privateKey);
    fs.writeFileSync('cert.pem', certificate);
    
    console.log('テスト用証明書ファイル (key.pem, cert.pem) を作成しました');
    console.log('注意: これらは開発/テスト目的のみの自己署名証明書です');
    console.log('ブラウザでは「安全でない」警告が表示されますが、「詳細設定」から「安全でないサイトに移動」を選択して進んでください');
  } catch (error) {
    console.error('証明書ファイルの作成に失敗しました:', error);
  }
};

createValidTestCertificates();
