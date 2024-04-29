import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './format/Statistics.css'; // Import the CSS file

import { Chart, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement} from 'chart.js';
import { Pie, Bar, Doughnut, Line } from 'react-chartjs-2';

Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const StatisticsCharts = () => {
  const [statistics, setStatistics] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  useEffect(() => {
    const fetchStatistics = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.get(`http://localhost:5000/api/task/getStatistics`, {
                headers: { 'x-access-token': token }
            });
            console.log(response.data);
            
            setStatistics(response.data);
            const currentDate = new Date();
            setDate(currentDate.toLocaleDateString());
            setTime(currentDate.toLocaleTimeString());
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    fetchStatistics();
  }, []);

  if (!statistics) {
    return <div>Loading...</div>;
  }

  return (
    <div>
    <button className='back' onClick={() => window.location.href = '/user-profile'}>
    Back to User Profile
    </button>
    <h2 className='header'> User Statistics</h2>
    <p className='timestamp'>Generated at {date} - {time}</p>

    <div className='statistics-container'>
      {/* Pie Chart for Priority Distribution */}
      <div className="statistics-chart">
        <h2>Priority Distribution</h2>
        <Pie
          data={{
            labels: ['Low', 'Medium', 'High'],
            datasets: [
              {
                data: [
                  statistics.priorityDistribution.Low,
                  statistics.priorityDistribution.Medium,
                  statistics.priorityDistribution.High,
                ],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
              },
            ],
          }}
          options={{
            plugins: {
                legend: {
                    display: true,
                }
            }
          }}
        />
        <p>Low: {statistics.priorityDistribution.Low}</p>
        <p>Medium: {statistics.priorityDistribution.Medium}</p>
        <p>High: {statistics.priorityDistribution.High}</p>
      </div>

   

      {/* Doughnut Chart for Tasks Assigned */}
      <div className="statistics-chart">
        <h2>Tasks Assigned</h2>
        <Doughnut
          data={{
            labels: ['Last Week', 'Last Month', 'Total'],
            datasets: [
              {
                label: 'Tasks Assigned',
                data: [
                  statistics.tasksAssignedLastWeek,
                  statistics.tasksAssignedLastMonth,
                  statistics.totalTasksAssigned,
                ],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
              },
            ],
          }}
        />
        <p>Last Week: {statistics.tasksAssignedLastWeek}</p>
        <p>Last Month: {statistics.tasksAssignedLastMonth}</p>
        <p>Total: {statistics.totalTasksAssigned}</p>

      </div>

         {/* Bar Chart for Tasks Created */}
         <div className="statistics-chart">
        <h2>Tasks Created Over Time</h2>
        <Bar
          data={{
            labels: ['Last Week', 'Last Month'],
            datasets: [
              {
                label: 'Tasks Created',
                data: [statistics.tasksCreatedLastWeek, statistics.tasksCreatedLastMonth],
                backgroundColor: 'rgba(75,192,192,0.2)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1,
              },
            ],
          }}
          options={{
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                  },
                },
              ],
            },
          }}
        />
        <p>Last Week: {statistics.tasksCreatedLastWeek}</p>
        <p>Last Month: {statistics.tasksCreatedLastMonth}</p>

      </div>

      {/* Line Chart for Average Completion Time */}
      <div className="statistics-chart">
            <h2>Average Completion Time</h2>
            <Bar
                data={{
                labels: ['Created', 'Assigned'],
                datasets: [
                    {
                    label: 'Average Completion Time (Hours)',
                    data: [
                        statistics.averageCompletionTime.created.days,
                        statistics.averageCompletionTime.assigned.days,
                    ],
                    backgroundColor: ['rgba(75,192,192,0.2)', 'rgba(75,192,192,0.2)'],
                    borderColor: ['rgba(75,192,192,1)', 'rgba(75,192,192,1)'],
                    borderWidth: 1,
                    },
                ],
                }}
                options={{
                indexAxis: 'y', // Change to 'y' for horizontal bar chart
                scales: {
                    y: {
                    ticks: {
                        beginAtZero: true,
                    },
                    
                    },
                },
                }}
            />
                <p>Average Completion Time (Created): {statistics?.averageCompletionTime?.created?.days?.toFixed(2)} days</p>
                <p>Average Completion Time (Assigned): {statistics?.averageCompletionTime?.assigned?.days?.toFixed(2)} days</p>
                <p>Average Completion Time (Created): {statistics?.averageCompletionTime?.created?.hours?.toFixed(2)} hours</p>
                <p>Average Completion Time (Assigned): {statistics?.averageCompletionTime?.assigned?.hours?.toFixed(2)} hours</p>

            </div>
        </div>
    </div>
  );
};

export default StatisticsCharts;
