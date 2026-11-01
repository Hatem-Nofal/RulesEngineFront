import { AfterViewInit, ChangeDetectorRef, Component, DestroyRef, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Chart as ChartInstance } from 'chart.js';
import type { Observable } from 'rxjs';
import { DashboardService } from 'src/app/proxy/dashboards/dashboard.service';
import type {
  ActivityViolationsDto,
  ClaimNumberViolationsDto,
  DashboardDetailsDto,
  RuleViolationsDto,
  WorkflowViolationsDto,
} from 'src/app/proxy/dashboards/dtos/models';

interface ViolationMetric {
  label: string;
  icon: string;
  count: number;
}

interface ChartEntry {
  label: string;
  count: number;
}

interface ViolationChart {
  key: string;
  title: string;
  icon: string;
  type: 'bar' | 'doughnut';
  total?: number;
  entries: ChartEntry[];
  loading: boolean;
  error: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: false,
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  // @ViewChild('summaryChart') private summaryCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChildren('chartCanvas') private chartCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly charts = new Map<string, ChartInstance<'bar' | 'doughnut', number[], string>>();

  loading = true;
  errorMessage = '';
  metrics: ViolationMetric[] = [];
  readonly violationCharts: ViolationChart[] = [
    { key: 'activity', title: 'Activity violations', icon: 'bi-activity', type: 'bar', entries: [], loading: true, error: '' },
    { key: 'claim-number', title: 'Claim number violations', icon: 'bi-file-earmark-medical', type: 'bar', entries: [], loading: true, error: '' },
    // { key: 'rule', title: 'Rule violations', icon: 'bi-journal-check', entries: [], loading: true, error: '' },
    { key: 'workflow', title: 'Workflow violations', icon: 'bi-diagram-3', type: 'bar', entries: [], loading: true, error: '' },
  ];

  ngAfterViewInit(): void {
    void this.createCharts();
    this.loadSummary();
    this.loadChartData(
      'activity',
      this.dashboardService.getActivityViolationsCountsByInput({}),
      (response) => ({
        total: response.total,
        entries: (response.activityViolationsCounts ?? []).map((item) => ({
          label: item.activity ?? 'Unknown activity',
          count: item.violationsCounts ?? 0,
        })),
      }),
    );
    this.loadChartData(
      'claim-number',
      this.dashboardService.getClaimNumberViolationsCountsByInput({}),
      (response) => ({
        total: response.total,
        entries: (response.claimNumberViolationsCount ?? []).map((item) => ({
          label: item.claimNumber ?? 'Unknown claim',
          count: item.violationsCounts ?? 0,
        })),
      }),
    );
    // this.loadChartData(
    //   'rule',
    //   this.dashboardService.getRuleViolationsCountsByInput({}),
    //   (response) => ({
    //     total: response.total,
    //     entries: (response.ruleViolationsCounts ?? []).map((item) => ({
    //       label: item.ruleName ?? 'Unknown rule',
    //       count: item.violationsCounts ?? 0,
    //     })),
    //   }),
    // );
    this.loadChartData(
      'workflow',
      this.dashboardService.getWorkflowViolationsCountsByInput({}),
      (response) => ({
        total: response.total,
        entries: (response.workflowViolationsCount ?? []).map((item) => ({
          label: item.workFlowName ?? 'Unknown workflow',
          count: item.violationsCounts ?? 0,
        })),
      }),
    );
  }

  ngOnDestroy(): void {
    this.charts.forEach((chart) => chart.destroy());
  }

  private loadSummary(): void {
    this.dashboardService
      .getDashboardDetailsByInput({})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (details) => {
          this.metrics = this.createMetrics(details);
          this.updateSummaryChart();
          this.loading = false;
          this.changeDetector.detectChanges();
        },
        error: (error: unknown) => {
          console.error('Failed to load dashboard violation details.', error);
          this.errorMessage = 'Unable to load dashboard summary. Please try again later.';
          this.loading = false;
          this.changeDetector.detectChanges();
        },
      });
  }

  private loadChartData<T>(
    key: string,
    request: Observable<T>,
    mapResponse: (response: T) => { total?: number; entries: ChartEntry[] },
  ): void {
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const chartData = this.violationCharts.find((chart) => chart.key === key);
        if (!chartData) {
          return;
        }

        const result = mapResponse(response);
        chartData.total = result.total;
        chartData.entries = result.entries.sort((a, b) => b.count - a.count);
        chartData.loading = false;
        this.updateChart(key);
        this.changeDetector.detectChanges();
      },
      error: (error: unknown) => {
        console.error(`Failed to load ${key} violation counts.`, error);
        const chartData = this.violationCharts.find((chart) => chart.key === key);
        if (chartData) {
          chartData.error = `Unable to load ${chartData.title.toLowerCase()}.`;
          chartData.loading = false;
          this.changeDetector.detectChanges();
        }
      },
    });
  }

  private createMetrics(details: DashboardDetailsDto): ViolationMetric[] {
    return [
      {
        label: 'Total workflows',
        icon: 'bi-diagram-3',
        count: details.totalWorkflowsCount ?? 0,
      },
      {
        label: 'Total rules',
        icon: 'bi-journal-check',
        count: details.totalRulesCount ?? 0,
      },
       {
        label: 'Workflow violations',
        icon: 'bi-diagram-3',
        count: details.totalWorkFlowViolatedCount ?? 0,
      },
      {
        label: 'Claim numbers with violations',
        icon: 'bi-file-earmark-medical',
        count: details.totalClaimNumberViolatedCount ?? 0,
      },

      {
        label: 'Total violations',
        icon: 'bi-exclamation-triangle',
        count: details.totalViolationCount ?? 0,
      },
    ];
  }

  private async createCharts(): Promise<void> {
    try {
      const { default: Chart } = await import('chart.js/auto');
      if (this.destroyRef.destroyed) {
        return;
      }

      // this.charts.set('summary', this.createBarChart(Chart, this.summaryCanvas.nativeElement));
      this.chartCanvases.forEach(({ nativeElement }) => {
        const key = nativeElement.dataset['chart'];
        if (key) {
          this.charts.set(key, this.createChart(Chart, nativeElement, this.violationCharts.find((item) => item.key === key)?.type ?? 'bar'));
          this.updateChart(key);
        }
      });
      this.updateSummaryChart();
      this.changeDetector.detectChanges();
    } catch (error: unknown) {
      console.error('Failed to initialize dashboard charts.', error);
      for (const chart of this.violationCharts) {
        chart.error = 'Unable to initialize this chart.';
        chart.loading = false;
      }
      this.changeDetector.detectChanges();
    }
  }

  private createChart(
    Chart: typeof import('chart.js/auto').default,
    canvas: HTMLCanvasElement,
    type: 'bar' | 'doughnut',
  ): ChartInstance<'bar' | 'doughnut', number[], string> {
    const data = {
      labels: [] as string[],
      datasets: [
        {
          label: 'Violations',
          data: [] as number[],
          backgroundColor: ['#3155a6', '#5574bd', '#7892d0', '#9eafe0', '#bed0f0'],
          borderRadius: type === 'bar' ? 6 : 0,
        },
      ],
    };

    if (type === 'doughnut') {
      return new Chart(canvas, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '62%',
          plugins: {
            legend: { display: true, position: 'bottom' },
            tooltip: { enabled: true },
          },
        },
      });
    }

    return new Chart(canvas, {
      type,
      data,
      options: {
        indexAxis: 'x',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      },
    });
  }

  private updateSummaryChart(): void {
    const chart = this.charts.get('summary');
    if (!chart) {
      return;
    }

    const summaryMetrics = this.metrics.filter((metric) => metric.label !== 'Total violations');
    chart.data.labels = summaryMetrics.map((metric) => metric.label);
    chart.data.datasets[0].data = summaryMetrics.map((metric) => metric.count);
    chart.update();
  }

  private updateChart(key: string): void {
    const chart = this.charts.get(key);
    const chartData = this.violationCharts.find((item) => item.key === key);
    if (!chart || !chartData) {
      return;
    }

    const topEntries = chartData.entries.slice(0, 10);
    chart.data.labels = topEntries.map((entry) => entry.label);
    chart.data.datasets[0].data = topEntries.map((entry) => entry.count);
    chart.update();
  }
}
