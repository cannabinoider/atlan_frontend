"use client";

import React from "react";
import { Doughnut } from "react-chartjs-2"; 

function DonutChart(props: any) {
  const chartData = {
    labels: props.chartData.map((data: any) => data.data),
    datasets: [
      {
        label: "Bookings",
        data: props.chartData.map((data: any) => data.count),
        backgroundColor: [
          "rgba(54,162,235,0.7)",
          "rgba(255,206,86,0.7)",
          "rgba(75,192,192,0.7)",
          "rgba(75,192,192,0.7)",
          "rgba(153,102,255,0.7)",
          "rgba(255,159,64,0.7)",
          "rgba(255,99,132,0.7)",
        ],
        borderColor: [
          "rgba(54,162,235,0.7)",
          "rgba(255,206,86,0.7)",
          "rgba(75,192,192,0.7)",
          "rgba(75,192,192,0.7)",
          "rgba(153,102,255,0.7)",
          "rgba(255,159,64,0.7)",
          "rgba(255,99,132,0.7)",
        ],
        borderWidth: 1,
        offset: 10,
        hoverOffset: 30,
        cutout: 50,
      },
    ],
  };
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  return (
    <div className="chart-container h-full pb-5 ">
      <div className="text-lg max-xl:text-center font-bold text-[#353738] capitalize">
        {props.title}
      </div>
      <div className="mx-auto h-full ">
        <Doughnut
          className="mx-auto" 
          data={chartData}
          options={{
            plugins: {
              
              legend: {
                display: true,
                position: "bottom",
              },
            },
            cutout: "20%",
          }}
        />
      </div>
    </div>
  );
}

export default DonutChart; 