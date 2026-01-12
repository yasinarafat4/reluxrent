import { Card, CardContent, CardHeader } from '@mui/material';
import { addDays, format, subDays } from 'date-fns';
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

const lastDay = new Date();
const lastMonthDays = Array.from({ length: 30 }, (_, i) => subDays(lastDay, i));
const aMonthAgo = subDays(new Date(), 30);

const dateFormatter = (date) => new Date(date).toLocaleDateString();

const aggregateOrdersByDay = (orders) =>
  orders
    .filter((order) => order.status !== 'cancelled')
    .reduce((acc, curr) => {
      const day = format(curr.date, 'yyyy-MM-dd');
      if (!acc[day]) {
        acc[day] = 0;
      }
      acc[day] += curr.total;
      return acc;
    }, {});

const getRevenuePerDay = (orders) => {
  const daysWithRevenue = aggregateOrdersByDay(orders);
  return lastMonthDays.map((date) => ({
    date: date.getTime(),
    total: daysWithRevenue[format(date, 'yyyy-MM-dd')] || 0,
  }));
};

const PreviousMonthChart = ({ orders }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!orders) return;

    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const revenueData = getRevenuePerDay(orders);

      // Configure the chart
      const option = {
        xAxis: {
          type: 'time',
          min: addDays(aMonthAgo, 1).getTime(),
          max: new Date().getTime(),
          axisLabel: {
            formatter: (value) => dateFormatter(value),
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value) => `$${value}`,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: [3, 4],
              color: '#aaa',
            },
          },
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const param = params[0];
            return `${dateFormatter(param.value[0])}: ${new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: 'USD',
            }).format(param.value[1])}`;
          },
          axisPointer: {
            type: 'line',
            lineStyle: {
              type: 'dashed',
              dashArray: [3, 3],
            },
          },
        },
        grid: {
          left: '0%',
          right: '1%',
          bottom: '0%',
          top: '2%',
          containLabel: true,
        },
        series: [
          {
            name: 'Revenue',
            type: 'line',
            smooth: true,
            smoothMonotone: 'x',
            symbol: 'none',
            sampling: 'average',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0.05, color: 'rgba(136, 132, 216, 0.8)' },
                { offset: 0.95, color: 'rgba(136, 132, 216, 0)' },
              ]),
            },
            lineStyle: {
              color: '#8884d8',
              width: 2,
            },
            data: revenueData.map((item) => [item.date, item.total]),
          },
        ],
      };

      // Apply the config
      chartInstance.current.setOption(option);
    }

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [orders]);

  return (
    <Card sx={{width: '100%'}}>
      <CardHeader title="Previous Month Revenue" />
      <CardContent>
        <div ref={chartRef} style={{ width: '100%', height: 300 }} />
      </CardContent>
    </Card>
  );
};

export default PreviousMonthChart;
