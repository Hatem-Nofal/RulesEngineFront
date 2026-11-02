import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SelectedDropDownListByGuid } from "@proxy/common/dtos";
import { LookupService } from "@proxy/lookups";
import { FormPageComponent } from "src/app/shared/components/CVA-Form/form-page/form-page.component";
import type { Chart as ChartInstance } from "chart.js";
import type { Observable } from "rxjs";
import { DashboardService } from "src/app/proxy/dashboards/dashboard.service";
import type {
  ActivityViolationsDto,
  ClaimNumberViolationsDto,
  DashboardDetailsDto,
  DashboardFilterDto,
  RuleViolationsDto,
  WorkflowViolationsDto,
} from "src/app/proxy/dashboards/dtos/models";

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
  type: "bar" | "doughnut";
  total?: number;
  entries: ChartEntry[];
  loading: boolean;
  error: string;
}

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
  standalone: true,
  imports: [CommonModule, FormPageComponent],
})
export class DashboardComponent implements AfterViewInit, OnDestroy, OnInit {
  // @ViewChild('summaryChart') private summaryCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChildren("chartCanvas") private chartCanvases!: QueryList<
    ElementRef<HTMLCanvasElement>
  >;

  dashboardFilterDto = signal<DashboardFilterDto>({});
  private readonly dashboardService = inject(DashboardService);
  private lookupservice = inject(LookupService);

  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly charts = new Map<
    string,
    ChartInstance<"bar" | "doughnut", number[], string>
  >();

  loading = true;
  errorMessage = "";
  metrics: ViolationMetric[] = [];
  workflows = signal<SelectedDropDownListByGuid[]>([]);

  readonly violationCharts: ViolationChart[] = [
       // { key: 'rule', title: 'Rule violations', icon: 'bi-journal-check', entries: [], loading: true, error: '' },
    {
      key: "workflow",
      title: "Workflow violations",
      icon: "bi-diagram-3",
      type: "bar",
      entries: [],
      loading: true,
      error: "",
    }, {
      key: "activity",
      title: "Activity violations",
      icon: "bi-activity",
      type: "bar",
      entries: [],
      loading: true,
      error: "",
    },
    {
      key: "claim-number",
      title: "Claim number violations",
      icon: "bi-file-earmark-medical",
      type: "bar",
      entries: [],
      loading: true,
      error: "",
    },

  ];
  dynamicControls: any[] = [
    {
      name: "workFlowName",
      label: "Work Flow Name",
      type: "dropdown",
      value: null,
    },
    { name: "fromDate", label: "Date From", type: "date", value: null },
    { name: "toDate", label: "Date To", type: "date", value: null },
    { name: "activity", label: "Activity", type: "text", value: null },
    { name: "claimNumber", label: "ClaimNumber", type: "text", value: null },
  ];
  ngAfterViewInit(): void {
    void this.createCharts();
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loadSummary();
    this.loadChartData(
      "activity",
      this.dashboardService.getActivityViolationsCountsByInput(
        this.dashboardFilterDto()
      ),
      (response) => ({
        total: response.total,
        entries: (response.activityViolationsCounts ?? []).map((item) => ({
          label: item.activity ?? "Unknown activity",
          count: item.violationsCounts ?? 0,
        })),
      })
    );

    this.loadChartData(
      "claim-number",
      this.dashboardService.getClaimNumberViolationsCountsByInput(
        this.dashboardFilterDto()
      ),
      (response) => ({
        total: response.total,
        entries: (response.claimNumberViolationsCount ?? []).map((item) => ({
          label: item.claimNumber ?? "Unknown claim",
          count: item.violationsCounts ?? 0,
        })),
      })
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
      "workflow",
      this.dashboardService.getWorkflowViolationsCountsByInput(
        this.dashboardFilterDto()
      ),
      (response) => ({
        total: response.total,
        entries: (response.workflowViolationsCount ?? []).map((item) => ({
          label: item.workFlowName ?? "Unknown workflow",
          count: item.violationsCounts ?? 0,
        })),
      })
    );
  }

  ngOnDestroy(): void {
    this.charts.forEach((chart) => chart.destroy());
  }
  ngOnInit(): void {
    this.lookupservice.getWorkflowsDropDownList().subscribe({
      next: (result) => {
        this.workflows.set(result);
        this.dynamicControls.find(
          (item) => item.name == "workFlowName"
        ).options = result.map((item) => ({
          name: item.name ?? "Unknown workflow",
          id: item.name ?? 0,
        }));
      },
    });
  }
  private loadSummary(): void {
    this.dashboardService
      .getDashboardDetailsByInput(this.dashboardFilterDto())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (details) => {
          this.metrics = this.createMetrics(details);
          this.updateSummaryChart();
          this.loading = false;
          this.changeDetector.detectChanges();
        },
        error: (error: unknown) => {
          console.error("Failed to load dashboard violation details.", error);
          this.errorMessage =
            "Unable to load dashboard summary. Please try again later.";
          this.loading = false;
          this.changeDetector.detectChanges();
        },
      });
  }

  private loadChartData<T>(
    key: string,
    request: Observable<T>,
    mapResponse: (response: T) => { total?: number; entries: ChartEntry[] }
  ): void {
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const chartData = this.violationCharts.find(
          (chart) => chart.key === key
        );
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
        const chartData = this.violationCharts.find(
          (chart) => chart.key === key
        );
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
        label: "Total workflows",
        icon: "bi-diagram-3",
        count: details.totalWorkflowsCount ?? 0,
      },
      {
        label: "Total rules",
        icon: "bi-journal-check",
        count: details.totalRulesCount ?? 0,
      },
      {
        label: "Workflow violations",
        icon: "bi-diagram-3",
        count: details.totalWorkFlowViolatedCount ?? 0,
      },
      {
        label: "Claim numbers with violations",
        icon: "bi-file-earmark-medical",
        count: details.totalClaimNumberViolatedCount ?? 0,
      },

      {
        label: "Total violations",
        icon: "bi-exclamation-triangle",
        count: details.totalViolationCount ?? 0,
      },
    ];
  }

  private async createCharts(): Promise<void> {
    try {
      const { default: Chart } = await import("chart.js/auto");
      if (this.destroyRef.destroyed) {
        return;
      }

      // this.charts.set('summary', this.createBarChart(Chart, this.summaryCanvas.nativeElement));
      this.chartCanvases.forEach(({ nativeElement }) => {
        const key = nativeElement.dataset["chart"];
        if (key) {
          this.charts.set(
            key,
            this.createChart(
              Chart,
              nativeElement,
              key,
              this.violationCharts.find((item) => item.key === key)?.type ??
                "bar"
            )
          );
          this.updateChart(key);
        }
      });
      this.updateSummaryChart();
      this.changeDetector.detectChanges();
    } catch (error: unknown) {
      console.error("Failed to initialize dashboard charts.", error);
      for (const chart of this.violationCharts) {
        chart.error = "Unable to initialize this chart.";
        chart.loading = false;
      }
      this.changeDetector.detectChanges();
    }
  }

  private createChart(
    Chart: typeof import("chart.js/auto").default,
    canvas: HTMLCanvasElement,
    key: string,
    type: "bar" | "doughnut"
  ): ChartInstance<"bar" | "doughnut", number[], string> {
    const backgroundColors: Record<string, string[]> = {
      activity: ["#3155a6", "#5574bd", "#7892d0", "#9eafe0", "#bed0f0"],
      "claim-number": [
        "#0fac77",
        "#0e9b6c",
        "#10B981",
        "#10B981",
        "#34D399",
        "#6EE7B7",
        "#A7F3D0",
        "#D1FAE5",
        "#ECFDF5",
        "#f4fff7",
      ],
      workflow: ["#c46a1b", "#d8873d", "#e4a568", "#edc092", "#f5d9bb"],
    };
    const data = {
      labels: [] as string[],
      datasets: [
        {
          label: "Violations",
          data: [] as number[],
          backgroundColor: backgroundColors[key] ?? ["#3155a6"],
          borderRadius: type === "bar" ? 6 : 0,
        },
      ],
    };

    if (type === "doughnut") {
      return new Chart(canvas, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "62%",
          plugins: {
            legend: { display: true, position: "bottom" },
            tooltip: { enabled: true },
          },
        },
      });
    }

    return new Chart(canvas, {
      type,
      data,
      options: {
        indexAxis: "x",
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
    const chart = this.charts.get("summary");
    if (!chart) {
      return;
    }

    const summaryMetrics = this.metrics.filter(
      (metric) => metric.label !== "Total violations"
    );
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

  sumbitFilter(event: any) {
    // debugger
    this.dashboardFilterDto().activity = event.activity;
    this.dashboardFilterDto().workFlowName = event.workFlowName;
    this.dashboardFilterDto().fromDate = event.fromDate;
    this.dashboardFilterDto().toDate = event.toDate;
    this.dashboardFilterDto().claimNumber = event.claimNumber;
    this.loadDashboardData();
  }
  resetFilter() {
    this.dashboardFilterDto().activity = null;
    this.dashboardFilterDto().workFlowName = null;
    this.dashboardFilterDto().fromDate = null;
    this.dashboardFilterDto().toDate = null;
    this.dashboardFilterDto().claimNumber = null;
    this.loadDashboardData();
  }
}
