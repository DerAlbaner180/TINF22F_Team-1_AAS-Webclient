/******************************************************************************
 *
 * Copyright (c) 2019-2023 Fraunhofer IOSB-INA Lemgo,
 * eine rechtlich nicht selbstaendige Einrichtung der Fraunhofer-Gesellschaft
 * zur Foerderung der angewandten Forschung e.V.
 *
 *****************************************************************************/

import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { trim } from 'lodash-es';
import { Subscription } from 'rxjs';
import { normalize } from '../convert';
import * as AASTreeActions from './aas-tree.actions';
import * as AASTreeSelectors from './aas-tree.selectors';
import { AASTreeRow, SearchTerm, SearchQuery, Operator, AASTreeFeatureState } from './aas-tree.state';
import {
    aas,
    AASAbbreviation,
    convertFromString,
    convertToString,
    getModelTypeFromAbbreviation,
    parseDate,
    parseNumber
} from 'common';
import { Injectable } from '@angular/core';

@Injectable()
export class AASTreeSearch {
    private store: Store<AASTreeFeatureState>
    private readonly loop = true;
    private subscription = new Subscription();
    private terms: SearchTerm[] = [];
    private rows: AASTreeRow[] = [];
    private index = -1;

    constructor(store: Store, private translate: TranslateService) {
        this.store = store as Store<AASTreeFeatureState>

        this.subscription.add(this.store.select(AASTreeSelectors.selectRows).pipe()
            .subscribe(rows => {
                this.rows = rows;
            }));

        this.subscription.add(this.store.select(AASTreeSelectors.selectTerms).pipe()
            .subscribe(terms => {
                this.terms = terms;
                this.findFirst();
            }));

        this.subscription.add(this.store.select(AASTreeSelectors.selectMatchIndex).pipe()
            .subscribe((value) => this.index = value));
    }

    public destroy(): void {
        this.subscription.unsubscribe();
    }

    public start(value: string) {
        if (value) {
            const terms: SearchTerm[] = [];
            for (const expression of this.splitOr(value)) {
                const term: SearchTerm = {};
                if (expression.length >= 3) {
                    if (expression.startsWith('#')) {
                        const query = this.parseExpression(expression);
                        if (query) {
                            term.query = query;
                        }
                    } else {
                        term.text = expression.toLocaleLowerCase(this.translate.currentLang);
                    }
                }

                if (term.text || term.query) {
                    terms.push(term);
                }
            }

            if (terms.length > 0) {
                this.store.dispatch(AASTreeActions.setSearchText({ terms }));
            } else {
                this.store.dispatch(AASTreeActions.setMatchIndex({ index: -1 }));
            }
        }
    }

    public findNext(): boolean {
        let completed = false;
        if (this.rows.length > 0 && (this.terms.length > 0)) {
            let match = false;
            let i = this.index < 0 ? 0 : this.index + 1;
            const start = i;
            while (this.loop) {
                if (this.match(this.rows[i])) {
                    match = true;
                    break;
                }

                if (++i >= this.rows.length) {
                    i = 0;
                    completed = true;
                }

                if (i === start) {
                    break;
                }
            }

            this.store.dispatch(AASTreeActions.setMatchIndex({ index: match ? i : -1 }));
        }

        return completed;
    }

    public findPrevious(): boolean {
        let completed = false;
        if (this.rows.length > 0 && (this.terms.length > 0)) {
            let match = false;
            let i = this.index <= 0 ? this.rows.length - 1 : this.index - 1;
            const start = i;
            while (this.loop) {
                if (this.match(this.rows[i])) {
                    match = true;
                    break;
                }

                if (--i <= 0) {
                    i = this.rows.length - 1;
                    completed = true;
                }

                if (i === start) {
                    break;
                }
            }

            this.store.dispatch(AASTreeActions.setMatchIndex({ index: match ? i : -1 }));
        }

        return completed;
    }

    private splitOr(s: string): string[] {
        return s.split('||').map(item => item.trim());
    }

    private findFirst(): void {
        if (this.rows.length > 0 && (this.terms.length > 0)) {
            let match = false;
            let i = this.index < 0 ? 0 : this.index;
            const start = i;
            while (this.loop) {
                if (this.match(this.rows[i])) {
                    match = true;
                    break;
                }

                if (++i >= this.rows.length) {
                    i = 0;
                }

                if (i === start) {
                    break;
                }
            }

            this.store.dispatch(AASTreeActions.setMatchIndex({ index: match ? i : -1 }));
        }
    }

    private parseExpression(expression: string): SearchQuery | null {
        let query: SearchQuery | null = null;
        const index = expression.indexOf(':');
        const tuple = this.parseOperator(expression);
        if (index >= 0) {
            const modelType = getModelTypeFromAbbreviation(expression.substring(1, index) as AASAbbreviation);
            if (modelType) {
                query = { modelType: modelType };
                if (tuple) {
                    query.name = expression.substring(index + 1, tuple.index).trim();
                    query.value = this.fromString(expression.substring(tuple.index + tuple.operator.length));
                    query.operator = tuple.operator;
                } else {
                    query.name = expression.substring(index + 1);
                }
            }
        } else if (tuple) {
            const modelType = getModelTypeFromAbbreviation(expression.substring(1, tuple.index) as AASAbbreviation);
            if (modelType) {
                query = { modelType: modelType };
                query.value = this.fromString(expression.substring(tuple.index + tuple.operator.length));
                query.operator = tuple.operator;
            }
        } else {
            const modelType = getModelTypeFromAbbreviation(expression.substring(1) as AASAbbreviation);
            if (modelType) {
                query = { modelType: modelType };
            }
        }

        return query;
    }

    private parseOperator(expression: string): { index: number, operator: Operator } | undefined {
        let index = expression.indexOf('<=');
        if (index > 0) {
            return { index: index, operator: '<=' };
        }

        index = expression.indexOf('>=');
        if (index > 0) {
            return { index: index, operator: '>=' };
        }

        index = expression.indexOf('!=');
        if (index > 0) {
            return { index: index, operator: '!=' };
        }

        index = expression.indexOf('=');
        if (index > 0) {
            return { index, operator: '=' };
        }

        index = expression.indexOf('>');
        if (index > 0) {
            return { index, operator: '>' };
        }

        index = expression.indexOf('<');
        if (index > 0) {
            return { index, operator: '<' };
        }

        return undefined
    }

    private fromString(s: string): string | boolean {
        s = s.trim();
        switch (s.toLowerCase()) {
            case 'true':
                return true;
            case 'false':
                return false;
            default:
                return trim(s, '\'"');
        }
    }

    private match(row: AASTreeRow): boolean {
        let match = false;
        for (const term of this.terms) {
            if (term.query) {
                if (row.element.modelType === term.query.modelType) {
                    if (term.query.name) {
                        if (this.containsString(row.name, term.query.name)) {
                            if (term.query.value) {
                                match = this.matchValue(row.element!, term.query.value, term.query.operator);
                            } else {
                                match = true;
                            }
                        }
                    } else if (term.query.value) {
                        match = this.matchValue(row.element!, term.query.value, term.query.operator);
                    } else {
                        match = true;
                    }
                }
            } else if (term.text) {
                match = row.name.toLocaleLowerCase(this.translate.currentLang).indexOf(term.text) >= 0 ||
                    row.typeInfo.toLocaleLowerCase(this.translate.currentLang).indexOf(term.text) >= 0 ||
                    (typeof row.value === 'string' &&
                        row.value.toLocaleLowerCase(this.translate.currentLang).indexOf(term.text) >= 0);
            }

            if (match) {
                break;
            }
        }

        return match;
    }

    private containsString(a: string, b?: string): boolean {
        return b == null || a.toLowerCase().indexOf(b.toLowerCase()) >= 0;
    }

    private matchValue(referable: aas.Referable, value: string | boolean, operator?: Operator): boolean {
        switch (referable.modelType) {
            case 'Property':
                return this.matchProperty(referable as aas.Property, value, operator);
            case 'File': {
                const fileName = normalize((referable as aas.File).value ?? '');
                return fileName ? this.containsString(fileName, value as string) : false;
            }
            case 'Entity': {
                const entity = referable as aas.Entity;
                return entity.globalAssetId ? this.containsString(entity.globalAssetId, value as string) : false;
            }
            case 'ReferenceElement': {
                const referenceElement = referable as aas.ReferenceElement;
                return referenceElement.value.keys.some(key => this.containsString(key.value, value as string));
            }
            case 'MultiLanguageProperty': {
                const langString = (referable as aas.MultiLanguageProperty).value;
                return langString ? langString.some(item => item ? this.containsString(item.text, value as string) : false) : false;
            }
            default:
                return false;
        }
    }

    private matchProperty(property: aas.Property, b: string | boolean, operator: Operator = '='): boolean {
        const a = convertFromString(property.value, property.valueType);
        if (typeof a === 'boolean') {
            return (typeof b === 'boolean') && a === b;
        } else if (typeof b === 'boolean') {
            return false;
        }

        if (typeof a === 'number') {
            if (typeof b === 'string') {
                const index = b.indexOf('...');
                const isDate = this.isDate(property.valueType);
                if (index >= 0) {
                    let min: number;
                    let max: number;
                    if (isDate) {
                        min = parseDate(b.substring(0, index).trim(), this.translate.currentLang)?.getTime() ?? 0;
                        max = parseDate(b.substring(index + 3).trim(), this.translate.currentLang)?.getTime() ?? 0;
                    } else {
                        min = parseNumber(b.substring(0, index).trim(), this.translate.currentLang);
                        max = parseNumber(b.substring(index + 3).trim(), this.translate.currentLang);
                    }

                    return typeof min === 'number' && typeof max === 'number' && a >= min && a <= max;
                } else {
                    const d = isDate
                        ? parseDate(b, this.translate.currentLang)?.getTime() ?? 0
                        : parseNumber(b, this.translate.currentLang);

                    if (typeof d !== 'number') {
                        return false;
                    }

                    switch (operator) {
                        case '<':
                            return a < d;
                        case '>':
                            return a > d;
                        case '>=':
                            return a >= d;
                        case '<=':
                            return a <= d;
                        case '!=':
                            return Math.abs(a - d) > 0.000001;
                        default:
                            return Math.abs(a - d) <= 0.000001;
                    }
                }
            }

            return false;
        }

        return this.containsString(convertToString(a), b) ||
            this.containsString(convertToString(a, this.translate.currentLang), b);
    }

    private isDate(valueType: aas.DataTypeDefXsd): boolean {
        switch (valueType) {
            case 'xs:date':
            case 'xs:dateTime':
                return true;
            default:
                return false;
        }
    }
}