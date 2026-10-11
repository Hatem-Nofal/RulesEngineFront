import { Component, OnInit } from '@angular/core';
import { ReportsService, ChartDto } from '@proxy/ehealth-claims/reports';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './ChartsReport.component.html',
  styleUrl: './ChartsReport.component.scss',
})
export class ChartsReportComponent implements OnInit {
  constructor(private reportsService: ReportsService) {}

  batchesData: number[] = [];
  claimsData: number[] = [];
  chartLabels: string[] = [];
  chartData: number[] = [];
  chartDto: ChartDto = undefined;
  isDataLoad = false;
  batchesChart: any;
  claimsChart: any;
  lineChart: any;
  ngOnInit(): void {
    this.reportsService.charts().subscribe(res => {
      this.chartDto = res;
      this.batchesData = res.batchesData;
      this.claimsData = res.claimsData;
      this.chartLabels = res.chartRecords.map(x => {
        const date = new Date(x.day);
        return new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'short',
          year: '2-digit',
        })
          .format(date)
          .replace(/ /g, ''); // e.g., "08Apr25"
      });
      this.chartData = res.chartRecords.map(x => x.recordCount);
      this.getBatchesChart();
      this.getClaimsChart();
      this.getLineChart();
      this.isDataLoad = true;
    });
  }
  getBatchesChart() {
    this.batchesChart = {
      type: 'pie',
      data: {
        labels: ['Draft', 'New', 'Pre-draft', 'Completed', 'Issued'],
        datasets: [
          {
            data: this.batchesData,
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
              'rgb(75,188,26)',
              'rgb(255, 153, 51)',
            ],
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          subtitle: {
            display: true,
            text: 'Batches',
          },
        },
      },
    };
  }

  getClaimsChart() {
    this.claimsChart = {
      type: 'pie',
      data: {
        labels: ['Draft', 'New', 'Pre-Draft'],
        datasets: [
          {
            data: this.claimsData,
            backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          subtitle: {
            display: true,
            text: 'Claims',
          },
        },
      },
    };
  }

  getLineChart() {
    this.lineChart = {
      type: 'line',
      data: {
        labels: this.chartLabels,
        datasets: [
          {
            label: 'Daily Claims',
            data: this.chartData,
            backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          subtitle: {
            display: true,
            text: 'Claims Over Time',
          },
        },
      },
    };
  }
}
