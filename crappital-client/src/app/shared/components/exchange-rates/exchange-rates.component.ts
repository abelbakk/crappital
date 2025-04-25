import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AuthService, CurrenciesService, CurrencyInfo } from '../../../generated/core-api';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
    selector: 'app-exchange-rates',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatPaginatorModule],
    templateUrl: './exchange-rates.component.html',
    styleUrl: './exchange-rates.component.less',
})
export class ExchangeRatesComponent implements OnInit {
    isLoggedIn: boolean = false;
    currencyInfos: Array<CurrencyInfo> = [];
    currentCurrency: CurrencyInfo | null = null;
    exchangeRates: { [key: string]: number } = {};
    form: FormGroup;

    mobilePageSize = 3;
    desktopPageSize = 12;
    currentPage = 0;

    paginatedExchangeRates: [string, number][] = [];

    constructor(
        private currenciesService: CurrenciesService,
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder,
    ) {
        this.form = this.fb.group({
            selectedCurrency: [''],
        });
    }

    ngOnInit(): void {
        this.checkAuthStatus();

        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            this.checkAuthStatus();
        });

        this.currenciesService.coreCurrenciesGet().subscribe((currencies) => {
            this.currencyInfos = currencies;
            this.form.get('selectedCurrency')?.setValue(currencies[0]);
            this.currentCurrency = currencies[0];
            this.exchangeRates = this.currentCurrency?.exchangeRates || {};
            this.updateDisplayedRates();
        });

        this.form.get('selectedCurrency')?.valueChanges.subscribe((currency) => {
            this.onCurrencyChange(currency);
            this.currentPage = 0;
            this.updateDisplayedRates();
        });
    }

    private checkAuthStatus() {
        this.authService.coreAuthStatusGet().subscribe({
            next: (_) => {
                this.isLoggedIn = true;
            },
            error: () => {
                this.isLoggedIn = false;
            },
        });
    }

    onCurrencyChange(currency: CurrencyInfo): void {
        this.currentCurrency = currency;
        this.exchangeRates = currency?.exchangeRates || {};
    }

    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.updateDisplayedRates();
    }

    get filteredExchangeRates(): Array<[string, number]> {
        return Object.entries(this.exchangeRates).filter(([key]) => key !== this.currentCurrency?.code);
    }

    private formatExchangeRates(rates: [string, number][]): [string, number][] {
        return rates.map(([currency, rate]) => [currency, Number(rate.toFixed(4))]);
    }

    updateDisplayedRates() {
        const start = this.currentPage * this.pageSize;
        const end = start + this.pageSize;
        this.paginatedExchangeRates = this.formatExchangeRates(this.filteredExchangeRates.slice(start, end));
    }

    get isMobile(): boolean {
        return window.innerWidth <= 767;
    }

    get pageSize(): number {
        return this.isMobile ? this.mobilePageSize : this.desktopPageSize;
    }
}
