"use client";
import React, { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import LineChart from "./LineChart";
import PieChart from "./PieChart";
import {
    getBookingData
} from "@/actions/api";



Chart.register(CategoryScale);

type apiData={
    created_at:string;
    good_type:string;
    payment_status:string;
    vehicle_type:string;
}

type GraphData = {
  date: string;
  data: string;
};

function Analytics() {
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState<{data:string,count:any}[]>([]);
  const [goodData, setGoodData] = useState<{data:string,count:any}[]>([]);
  const [bookings, setBookings] = useState<{date:any,data:any}[]>([]);
  

  useEffect(() => {
    fetchGraph();
}, []);

  const fetchGraph = async () => {
    try {
      setLoading(true);
        const room = await getBookingData();

        const monthNamesShort = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
                
        
        const bookings = room.vehicle.map((entry: apiData) => {
    const date = new Date(entry.created_at);
    const day = date.getDate();
    const monthShort = monthNamesShort[date.getMonth()]; 

    const formattedDate = `${day}-${monthShort}`; 

    return {
      date: formattedDate, 
      data: entry.payment_status,
      createdAt: date, 
    };
  })
  .sort((a:any, b:any) => a.createdAt.getTime() - b.createdAt.getTime()); 
const sortedBookings = bookings.map(({ date, data }:{date:any,data:any}) => ({ date, data }));

console.log(sortedBookings);

        setBookings(bookings)
        
        const vehicleTypeCount = room.vehicle.reduce((acc: Record<string, number>, entry: apiData) => {
          acc[entry.vehicle_type] = (acc[entry.vehicle_type] || 0) + 1;
          return acc;
        }, {});
        const vehicleTypeList = Object.entries(vehicleTypeCount).map(([data, count]) => ({
          data,
          count,
        }));
        console.log(vehicleTypeList)
        
        const goodTypeCount = room.vehicle.reduce((acc: Record<string, number>, entry: apiData) => {
          acc[entry.good_type] = (acc[entry.good_type] || 0) + 1;
          return acc;
        }, {});
        const goodTypeList = Object.entries(goodTypeCount).map(([data, count]) => ({
          data,
          count,
        }));
        console.log(goodTypeCount)
      setVehicleData(vehicleTypeList)
      setGoodData(goodTypeList)

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };


  return (
    <div className="p-5 max-lg:p-1 ml-48">
      <div className="text-4xl mx-5 px-5 flex justify-between items-center font-semibold max-lg:px-2 max-lg:mx-0">
        <div className={`${loading && "animate-pulse"}`}>Analytics</div>
        
        
      </div>

      <div className=" m-5 rounded-xl p-5 max-lg:m-0 max-lg:p-2">
        <div className="flex justify-end"></div>
        <div className="grid grid-cols-2 gap-5 mt-5 max-xl:grid-cols-1">
          {loading && (
            <div className="p-5 animate-pulse shadow-md w-full xl:h-[45vh] border flex flex-col gap-y-5 py-6 rounded-xl max-lg:p-0">
              <div className="w-36 h-5 rounded-2xl bg-gray-200"></div>
              <div className="w-full h-full bg-gray-200 rounded-md"></div>
            </div>
          )}
          {!loading && (
            
              <div className="p-5 shadow-md w-full  xl:h-[45vh]  border rounded-xl max-lg:p-0">
              <PieChart chartData={vehicleData} title={`Vehicle Type Wise Booking`} />
            </div>
          )}
          {loading && (
            <div className="p-5 animate-pulse shadow-md w-full xl:h-[45vh] border flex flex-col gap-y-5 py-6 rounded-xl max-lg:p-0">
              <div className="w-36 h-5 rounded-2xl bg-gray-200"></div>
              <div className="w-full h-full bg-gray-200 rounded-md"></div>
            </div>
          )}
          {!loading && (
            <div className="p-5 shadow-md w-full  xl:h-[45vh]  border rounded-xl max-lg:p-0">
              <PieChart chartData={goodData} title={`Goods type Wise Booking Per`} />
            </div>
          )}
          {loading && (
            <div className="p-5 animate-pulse shadow-md w-full xl:h-[45vh] border flex flex-col gap-y-5 py-6 rounded-xl max-lg:p-0">
              <div className="w-36 h-5 rounded-2xl bg-gray-200"></div>
              <div className="w-full h-full bg-gray-200 rounded-md"></div>
            </div>
          )}
          {!loading && (
            <div className="p-5 shadow-md w-full xl:h-[45vh]  border rounded-xl max-lg:p-0">
              <LineChart
                theme="red"
                chartData={bookings}
                title={`Bookings`}

              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;