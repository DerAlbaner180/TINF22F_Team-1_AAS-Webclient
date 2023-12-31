/******************************************************************************
 *
 * Copyright (c) 2019-2023 Fraunhofer IOSB-INA Lemgo,
 * eine rechtlich nicht selbstaendige Einrichtung der Fraunhofer-Gesellschaft
 * zur Foerderung der angewandten Forschung e.V.
 *
 *****************************************************************************/

import { createAction, props } from '@ngrx/store';
import { AASDocument } from 'common';
import { AASTreeRow, SearchTerm } from './aas-tree.state';
import { TypedAction } from '@ngrx/store/src/models';

export enum AASTreeActionType {
    UPDATE_ROWS = '[AASTree] Update Rows',
    EXPAND_ROW = '[AASTree] Expand Row',
    COLLAPSE_ROW = '[AASTree] Collapse Row',
    COLLAPSE = '[AASTree] Collapse',
    TOGGLE_SELECTED = '[AASTree] Toggle selected',
    TOGGLE_SELECTIONS = '[AASTree] Toggle selections',
    SET_SEARCH_TEXT = '[AASTree] set search test',
    SET_MATCH_INDEX = '[AASTree] set match index',
    SET_ROW_VALUE = '[AASTree] set blob value'
}

export const updateRows = createAction(
    AASTreeActionType.UPDATE_ROWS,
    props<{ document: AASDocument | null; localeId: string }>());

export const expandRow = createAction(
    AASTreeActionType.EXPAND_ROW,
    props<{ arg: number | AASTreeRow }>());

export const collapseRow = createAction(
    AASTreeActionType.COLLAPSE_ROW,
    props<{ row: AASTreeRow }>());

export const collapse = createAction(
    AASTreeActionType.COLLAPSE);

export const toggleSelected = createAction(
    AASTreeActionType.TOGGLE_SELECTED,
    props<{ row: AASTreeRow }>());

export const toggleSelections = createAction(
    AASTreeActionType.TOGGLE_SELECTIONS,
    props<{ document: AASDocument | null }>());

export const setSearchText = createAction(
    AASTreeActionType.SET_SEARCH_TEXT,
    props<{ terms: SearchTerm[] }>());

export const setMatchIndex = createAction(
    AASTreeActionType.SET_MATCH_INDEX,
    props<{ index: number }>());
    