import React, { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Papa from 'papaparse';
import { 
  BarChart3, 
  Cpu, 
  Database, 
  Zap, 
  Clock, 
  TowerControl, 
  Info 
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SimulationData {
  N: number;
  Offered_Traffic_G: number;
  'Pure ALOHA (LBTなし) (Sim)': number;
  'Pure ALOHA Theory': number;
  'Pure ALOHA (LBTあり) (Sim)': number;
  'Slotted ALOHA (Sim)': number;
  'Slotted ALOHA Theory': number;
}

const App: React.FC = () => {
  const [data, setData] = useState<SimulationData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('./data/results.csv');
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results: Papa.ParseResult<SimulationData>) => {
            const filteredData = results.data.filter(row => row.N !== null);
            setData(filteredData);
          }
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: data.map(d => d.N),
    datasets: [
      {
        label: '純粋 ALOHA (シミュレーション)',
        data: data.map(d => d['Pure ALOHA (LBTなし) (Sim)']),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 5,
      },
      {
        label: '純粋 ALOHA (理論値)',
        data: data.map(d => d['Pure ALOHA Theory']),
        borderColor: '#6366f1',
        borderDash: [5, 5],
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'スロット付 ALOHA (シミュレーション)',
        data: data.map(d => d['Slotted ALOHA (Sim)']),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 5,
      },
      {
        label: 'スロット付 ALOHA (理論値)',
        data: data.map(d => d['Slotted ALOHA Theory']),
        borderColor: '#10b981',
        borderDash: [5, 5],
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'LBT / CSMA (シミュレーション)',
        data: data.map(d => d['Pure ALOHA (LBTあり) (Sim)']),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 4,
        tension: 0.4,
        pointRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 12 },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      x: {
        title: { display: true, text: '端末数 (N)', color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        title: { display: true, text: 'パケット到達率 (PDR)', color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' },
        min: 0,
        max: 1
      }
    }
  };

  return (
    <div className="app-container">
      <div className="parallax-bg"></div>
      
      <header>
        <h1>LoRa シミュレータ</h1>
        <p className="subtitle">
          920MHz帯 LPWA環境における ALOHA バリアントと LBT プロトコルの性能解析
        </p>
      </header>

      <main>
        <div className="dashboard-grid">
          {/* PDR Chart */}
          <div className="card full-width">
            <h2><BarChart3 className="inline mr-2 text-indigo-500" /> パケット到達率 (PDR) の比較</h2>
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Simulation Params */}
          <div className="card">
            <h2><Cpu className="inline mr-2 text-indigo-500" /> シミュレーション設定</h2>
            <div className="params-list">
              {[
                { label: '帯域幅', value: '125 kHz' },
                { label: 'パケット長', value: '70 ms' },
                { label: 'キャリアセンス (CS) 時間', value: '5 ms' },
                { label: 'SINR 閾値', value: '6 dB' },
                { label: '運用環境', value: '920 MHz (日本国内仕様)' }
              ].map((p, i) => (
                <div key={i} className="param-item">
                  <span>{p.label}</span>
                  <span className="font-semibold">{p.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="card">
            <h2><Database className="inline mr-2 text-indigo-500" /> 最新の実行結果</h2>
            <div className="overflow-x-auto">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>端末数 (N)</th>
                    <th>純粋 ALOHA</th>
                    <th>スロット付</th>
                    <th>LBT (CSMA)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i}>
                      <td className="font-semibold">{row.N}</td>
                      <td>{(row['Pure ALOHA (LBTなし) (Sim)'] * 100).toFixed(1)}%</td>
                      <td>{(row['Slotted ALOHA (Sim)'] * 100).toFixed(1)}%</td>
                      <td className="text-amber-500 font-semibold">
                        {(row['Pure ALOHA (LBTあり) (Sim)'] * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <section className="info-section">
          <div className="info-content">
            <h2>プロトコルについて</h2>
            <p>LoRaのようなLPWAネットワークでは、限られた周波数資源を効率的に共有するために様々な競合制御メカニズムが使用されます。</p>
            
            <div className="protocol-feature">
              <div className="feature-icon"><Zap /></div>
              <div className="feature-text">
                <h3>純粋 (Pure) ALOHA</h3>
                <p>パケットが発生した瞬間に即座に送信を開始します。構造は単純ですが、通信量が増えると衝突が発生しやすくなります。</p>
              </div>
            </div>

            <div className="protocol-feature">
              <div className="feature-icon"><Clock /></div>
              <div className="feature-text">
                <h3>スロット付 (Slotted) ALOHA</h3>
                <p>時間を一定のスロットに区切り、スロットの開始時刻にのみ送信を許可します。衝突の危険時間を半分に減らすことができます。</p>
              </div>
            </div>

            <div className="protocol-feature">
              <div className="feature-icon"><TowerControl /></div>
              <div className="feature-text">
                <h3>LBT (Listen Before Talk)</h3>
                <p>送信前にチャネルを傍受し、他の通信がないか確認します。高密度なネットワークにおいて劇的に衝突を抑制します。</p>
              </div>
            </div>
          </div>

          <div className="card info-visual">
            <h3 className="flex items-center gap-2 mb-4"><Info size={20} /> 理論値とシミュレーション</h3>
            <p>
              理論曲線とシミュレーション結果の乖離は、主に<strong>キャプチャ効果</strong>に起因します。
              これは、複数の通信が重なっても、目的の信号が十分に強ければ受信に成功する現象をモデル化したものです。
            </p>
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2026 LoRa 研究プロジェクト. オープンサイエンスのために構築されました。</p>
      </footer>
    </div>
  );
};

export default App;
