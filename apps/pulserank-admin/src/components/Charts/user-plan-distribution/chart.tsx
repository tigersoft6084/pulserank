"use client";

import { compactFormat } from "@/lib/format-number";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type PropsType = {
  data: {
    name: string;
    value: number;
  }[];
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function DonutChart({ data }: PropsType) {
  // Define colors for different plan types
  const colors = [
    "#3B82F6", // Blue for Freelance
    "#1D4ED8", // Darker blue for Freelance Yearly
    "#10B981", // Green for Studio
    "#059669", // Darker green for Studio Yearly
    "#F59E0B", // Orange for Agency
    "#D97706", // Darker orange for Agency Yearly
    "#6B7280", // Gray for No Active Subscription
  ];

  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
    },
    colors: colors,
    labels: data.map((item) => item.name),
    legend: {
      show: true,
      position: "bottom",
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
      formatter: (legendName, opts) => {
        const { seriesPercent } = opts.w.globals;
        return `${legendName}: ${parseFloat(seriesPercent[opts.seriesIndex]).toFixed(2)}%`;
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "80%",
          background: "transparent",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: "Users",
              fontSize: "16px",
              fontWeight: "400",
            },
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: "bold",
              formatter: (val) => compactFormat(+val),
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 415,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: "100%",
          },
        },
      },
      {
        breakpoint: 370,
        options: {
          chart: {
            width: 260,
          },
        },
      },
    ],
  };

  return (
    <Chart
      options={chartOptions}
      series={data.map((item) => item.value)}
      type="donut"
    />
  );
}
