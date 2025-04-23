import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Account, StatisticsService } from '../../generated/core-api';

declare const Chart: any;

@Component({
    selector: 'app-spending-widget',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatFormFieldModule, MatDatepickerModule, MatNativeDateModule],
    templateUrl: './spending-widget.component.html',
    styleUrl: './spending-widget.component.less',
})
export class SpendingWidgetComponent implements OnInit {
    @Input() userId?: string;
    @Input() account?: Account;

    @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

    form: FormGroup;
    private chart?: any;

    constructor(
        private statisticsService: StatisticsService,
        private fb: FormBuilder,
    ) {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setDate(today.getDate() - 90);

        this.form = this.fb.group({
            fromDate: [threeMonthsAgo],
            toDate: [today],
        });
    }

    ngOnInit() {
        this.loadData();
    }

    onDateChange() {
        this.loadData();
    }

    private loadData() {
        const from = this.form.value.fromDate?.toISOString().slice(0, 10);
        const to = this.form.value.toDate?.toISOString().slice(0, 10);

        if (!this.userId || !from || !to) {
            return;
        }

        const accId = this.account?._id;
        this.statisticsService.coreStatisticsSpendingUserIdGet(this.userId, from, to, accId).subscribe((resp) => {
            const labels = resp.spendings?.map((s) => `${s.categoryIcon} ${s.categoryName}: ${s.amount} ${resp.currency}`);
            const data = resp.spendings?.map((s) => s.amount);
            const colors = resp.spendings?.map((s) => s.color);

            if (this.chart) {
                this.chart.data.labels = labels;
                this.chart.data.datasets[0].data = data;
                this.chart.data.datasets[0].backgroundColor = colors;
                this.chart.update();
            } else {
                const ctx = this.chartCanvas.nativeElement.getContext('2d');
                this.chart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels,
                        datasets: [{ data, backgroundColor: colors, hoverOffset: 6 }],
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { position: 'bottom' } },
                    },
                });
            }
        });
    }
}
