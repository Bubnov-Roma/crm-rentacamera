import { TestComponent } from '@rentacamera/ui';

export default function Home() {
  return (
    <main style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 Добро пожаловать в Rentacamera!</h1>
      <p>Система находится в разработке...</p>

      <TestComponent message="UI package успешно подключен!" />

      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
        <h3>Статус системы:</h3>
        <ul>
          <li>✅ Monorepo настроен</li>
          <li>✅ Зависимости установлены</li>
          <li>✅ Prisma сгенерирован</li>
          <li>🔄 Сборка пакетов...</li>
        </ul>
      </div>
    </main>
  );
}
