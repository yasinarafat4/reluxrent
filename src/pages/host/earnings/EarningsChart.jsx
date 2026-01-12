import { Box, Divider, Stack, Typography } from '@mui/material';
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

const EarningsChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const data = [
      { month: 'Mar', value: 0 },
      { month: 'Apr', value: 0 },
      { month: 'May', value: 0 },
      { month: 'Jun', value: 0 },
      { month: 'Jul', value: 0 },
      { month: 'Aug', value: 0 },
      { month: 'Sep', value: 0 },
      { month: 'Oct', value: 0 },
      { month: 'Nov', value: 0 },
      { month: 'Dec', value: 0 },
      { month: 'Jan', value: 0 },
      { month: 'Feb', value: 0 },
    ];

    const option = {
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map((item) => item.month),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          // color: 'text.primary',
          fontWeight: 500,
        },
      },
      yAxis: {
        type: 'value',
        splitLine: {
          lineStyle: { color: '#eee' },
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#777',
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        textStyle: {
          color: '#000',
        },
        formatter: (params) => {
          const value = params[0].data;
          return `<strong>$${value}</strong> earned`;
        },
        axisPointer: {
          type: 'shadow',
        },
      },
      series: [
        {
          type: 'bar',
          data: data.map((item) => item.value),
          barWidth: '50%',
          itemStyle: {
            color: '#FF385C',
            borderRadius: [6, 6, 0, 0],
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  return (
    <Stack sx={{ width: '100%' }} direction={{ xs: 'column', md: 'row' }} gap={{ xs: 2, sm: 4, md: 2, lg: 4 }}>
      <Box flex={1}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Earnings
        </Typography>

        <Typography fontSize={26} fontWeight={600} mb={2}>
          You've made{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            $125.13
          </Box>{' '}
          this month
        </Typography>

        <div ref={chartRef} style={{ width: '100%', height: 300 }} />
      </Box>
      {/* Summary Card */}
      <Box
        elevation={0}
        sx={{
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          width: { sm: 300 },
        }}
      >
        {/* Title + Date */}
        <Stack spacing={0.5} mb={2}>
          <Typography variant="subtitle1" fontWeight={600}>
            Year-to-date summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Jan 1 - Sep 6, 2025
          </Typography>
        </Stack>

        {/* Summary Items */}
        <Stack spacing={1.2}>
          <SummaryRow label="Gross earnings" value="$1,416.00" />
          <SummaryRow label="Adjustments" value="$0.00" />
          <SummaryRow label="Reluxrent service fee" value="- $42.48" valueColor="error.main" />
          <SummaryRow label="Tax withheld" value="$0.00" />

          <Divider sx={{ my: 1 }} />

          <SummaryRow label="Total (USD)" value="$1,373.52" bold />
        </Stack>
      </Box>
    </Stack>
  );
};

export default EarningsChart;

// Small helper component for summary rows
function SummaryRow({ label, value, bold = false }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        borderColor: 'divider',
      }}
    >
      <Typography fontSize={14} fontWeight={bold ? 600 : 400}>
        {label}
      </Typography>
      <Typography fontSize={14} fontWeight={bold ? 600 : 400}>
        {value}
      </Typography>
    </Box>
  );
}
