import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function SalesChart({ data, type = 'line' }) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
            weight: '500'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(30, 58, 95, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e0f2fe',
        padding: 12,
        borderColor: '#0ea5e9',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold',
          family: 'Inter, system-ui, sans-serif'
        },
        bodyFont: {
          size: 13,
          family: 'Inter, system-ui, sans-serif'
        },
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutQuart',
        delay: (context) => {
          let delay = 0;
          if (context.type === 'data' && context.mode === 'default') {
            delay = context.dataIndex * 50;
          }
          return delay;
        }
      }
    },
    scales: type !== 'doughnut' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif'
          },
          color: '#64748b',
          callback: function(value) {
            return new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif'
          },
          color: '#64748b'
        }
      }
    } : undefined,
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const lineChartData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      borderColor: index === 0 ? '#0ea5e9' : '#8b5cf6',
      backgroundColor: index === 0 
        ? 'rgba(14, 165, 233, 0.1)' 
        : 'rgba(139, 92, 246, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 3,
      pointHoverBorderWidth: 4
    }))
  };

  const barChartData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: index === 0
        ? 'rgba(14, 165, 233, 0.8)'
        : 'rgba(139, 92, 246, 0.8)',
      borderColor: index === 0 ? '#0ea5e9' : '#8b5cf6',
      borderWidth: 2,
      borderRadius: 8,
      hoverBackgroundColor: index === 0 
        ? 'rgba(14, 165, 233, 1)' 
        : 'rgba(139, 92, 246, 1)'
    }))
  };

  const doughnutChartData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: [
        'rgba(14, 165, 233, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(250, 204, 21, 0.8)'
      ],
      borderColor: '#fff',
      borderWidth: 3,
      hoverOffset: 15
    }))
  };

  return (
    <div className="h-full w-full">
      {type === 'line' && <Line data={lineChartData} options={chartOptions} />}
      {type === 'bar' && <Bar data={barChartData} options={chartOptions} />}
      {type === 'doughnut' && <Doughnut data={doughnutChartData} options={chartOptions} />}
    </div>
  );
}