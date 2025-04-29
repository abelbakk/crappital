import { Component, forwardRef, OnInit, AfterViewChecked } from '@angular/core';
import { CurrenciesService, CurrencyInfo } from '../../../generated/core-api';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

const FLAG_EMOJIS: Record<string, string> = {
    USD: '🇺🇸',
    JPY: '🇯🇵',
    BGN: '🇧🇬',
    CZK: '🇨🇿',
    DKK: '🇩🇰',
    GBP: '🇬🇧',
    HUF: '🇭🇺',
    PLN: '🇵🇱',
    RON: '🇷🇴',
    SEK: '🇸🇪',
    CHF: '🇨🇭',
    ISK: '🇮🇸',
    NOK: '🇳🇴',
    TRY: '🇹🇷',
    AUD: '🇦🇺',
    BRL: '🇧🇷',
    CAD: '🇨🇦',
    CNY: '🇨🇳',
    HKD: '🇭🇰',
    IDR: '🇮🇩',
    ILS: '🇮🇱',
    INR: '🇮🇳',
    KRW: '🇰🇷',
    MXN: '🇲🇽',
    MYR: '🇲🇾',
    NZD: '🇳🇿',
    PHP: '🇵🇭',
    SGD: '🇸🇬',
    THB: '🇹🇭',
    ZAR: '🇿🇦',
    EUR: '🇪🇺',
};

declare global {
    interface Window {
        twemoji: any;
    }
}

@Component({
    selector: 'app-currency-picker',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatSelectModule],
    templateUrl: './currency-picker.component.html',
    styleUrl: './currency-picker.component.less',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CurrencyPickerComponent),
            multi: true,
        },
    ],
})
export class CurrencyPickerComponent implements OnInit, ControlValueAccessor, AfterViewChecked {
    currencies: CurrencyInfo[] = [];
    selectedCurrency: CurrencyInfo | null = null;
    disabled = false;

    private onChange = (value: any) => {};
    private onTouched = () => {};

    constructor(private currenciesService: CurrenciesService) {}

    ngOnInit(): void {
        this.currenciesService.coreCurrenciesGet().subscribe((currencies) => {
            this.currencies = currencies;
        });
    }

    ngAfterViewChecked(): void {
        if (window.twemoji) {
            window.twemoji.parse(document.body, {
                folder: 'svg',
                ext: '.svg',
            });
        }
    }

    onSelectionChange(currency: CurrencyInfo): void {
        this.selectedCurrency = currency;
        this.onChange(currency);
        this.onTouched();
    }

    getFlag(code: string): string {
        return FLAG_EMOJIS[code] || '';
    }

    compareCurrency(c1: CurrencyInfo | null, c2: CurrencyInfo | null): boolean {
        if (!c1 || !c2) {
            return c1 === c2;
        }
        return c1.code === c2.code;
    }

    writeValue(currency: CurrencyInfo): void {
        this.selectedCurrency = currency;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
