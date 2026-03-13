import React from 'react';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const labels = ['Day 1', 'Day 6', 'Day 11', 'Day 16', 'Day 21', 'Day 26'];

const chartData = {
  labels,
  datasets: [
    {
      label: 'Estrogen',
      data: [8, 45, 78, 92, 70, 40],
      borderColor: '#e84f9f',
      backgroundColor: 'rgba(232, 79, 159, 0.08)',
      fill: true,
      tension: 0.35,
      pointRadius: 0,
    },
    {
      label: 'Progesterone',
      data: [10, 10, 10, 22, 46, 72],
      borderColor: '#ef9b07',
      backgroundColor: 'rgba(239, 155, 7, 0.06)',
      fill: true,
      tension: 0.35,
      pointRadius: 0,
    },
    {
      label: 'LH',
      data: [10, 10, 10, 100, 10, 10],
      borderColor: '#9b5cf5',
      backgroundColor: 'rgba(155, 92, 245, 0.08)',
      fill: false,
      tension: 0.35,
      pointRadius: 0,
    },
    {
      label: 'FSH',
      data: [35, 58, 38, 15, 15, 15],
      borderColor: '#13a8d2',
      backgroundColor: 'rgba(19, 168, 210, 0.06)',
      fill: false,
      tension: 0.35,
      pointRadius: 0,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        boxWidth: 10,
        color: '#7f90a8',
        font: {
          size: 12,
          weight: 700,
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#7f90a8',
      },
      grid: {
        display: false,
      },
    },
    y: {
      suggestedMin: 0,
      suggestedMax: 100,
      ticks: {
        color: '#7f90a8',
        stepSize: 25,
      },
      grid: {
        color: '#eef2f7',
      },
    },
  },
};

const snapshot = [
  { name: 'Estrogen', value: 90, status: 'High', color: 'bg-rose-quartz', statusColor: 'text-sage-green' },
  { name: 'Progesterone', value: 12, status: 'Low', color: 'bg-sunrise', statusColor: 'text-muted' },
  { name: 'LH Surge', value: 92, status: 'High', color: 'bg-[#9b5cf5]', statusColor: 'text-sage-green' },
];

const suggestions = {
  phase: 'Ovulation Phase',
  subtitle: 'Peak energy & confidence',
  cards: [
    {
      title: 'Diet',
      points: [
        'Anti-inflammatory foods',
        'Cruciferous veggies (broccoli, kale)',
        'Berries and antioxidant-rich fruits',
        'Healthy fats (avocado, nuts)',
      ],
    },
    {
      title: 'Exercise',
      points: [
        'High-intensity interval training',
        'Strength training at peak',
        'Dance or spin classes',
        'Maximize your energy window',
      ],
    },
    {
      title: 'Lifestyle',
      points: [
        'Schedule important meetings',
        'Public speaking or presentations',
        'Date nights and social events',
        'Tackle challenging tasks',
      ],
    },
    {
      title: 'Self-Care',
      points: [
        'Celebrate your confidence',
        'Express yourself creatively',
        'Spend time in nature',
        'Practice gratitude',
      ],
    },
  ],
};

const Insights: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="grid gap-5 xl:grid-cols-[2.2fr_1fr]">
        <article className="bloom-card p-5">
          <h2 className="section-title">Hormone Levels</h2>
          <p className="card-meta">Predicted levels based on your cycle day</p>
          <div className="mt-4 h-[380px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </article>

        <article className="bloom-card p-5">
          <h3 className="section-title">Today's Hormone Snapshot</h3>
          <p className="card-meta">Day 14 predicted levels</p>

          <div className="mt-5 space-y-4">
            {snapshot.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[1.08rem] font-semibold text-ink">{item.name}</p>
                  <p className={`text-[1.08rem] font-semibold ${item.statusColor}`}>{item.status}</p>
                </div>
                <div className="h-3 rounded-full bg-[#f0f3f8]">
                  <div className={`h-3 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <section>
        <h2 className="page-title">✦ Lifestyle & Diet Suggestions</h2>

        <article className="bloom-card mt-4 bg-soft-peach p-5">
          <h3 className="section-title">{suggestions.phase}</h3>
          <p className="card-meta">{suggestions.subtitle}</p>
        </article>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {suggestions.cards.map((card) => (
            <article key={card.title} className="bloom-card p-5">
              <h4 className="section-title">{card.title}</h4>
              <ul className="mt-3 space-y-2 text-[0.92rem] text-muted">
                {card.points.map((point) => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Insights;
