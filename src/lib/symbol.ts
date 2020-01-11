import { StateContext, Store } from '@ngxs/store';
import { ModuleWithProviders, Provider, Type } from '@angular/core';
import { TestBedStatic } from '@angular/core/testing';
import { NgxsConfig } from '@ngxs/store/src/symbols';
import { Observable } from 'rxjs';

export interface NgxsOptionsTesting {
    states?: Type<unknown>[];
    ngxsOptions?: Partial<NgxsConfig>;
    imports?: ModuleWithProviders[];
    before?: () => void;
    providers?: Provider[];
}

export interface StateContextMap {
    [key: string]: StateContext<unknown>;
}

export type ResetFn<T = any> = (state: T) => T;
export type SnapshotFn<T = any> = () => T;
export type DispatchFn<T = any, U = any> = (event: U | U[]) => Observable<T>;
export type SelectFn<T = any, U = any> =
    | ((selector: string) => Observable<T>)
    | ((selector: Type<U>) => Observable<T>)
    | ((selector: any) => Observable<T>);

export type SelectSnapshotFn<T = any, U = any> =
    | ((selector: string) => T)
    | ((selector: Type<U>) => T)
    | ((selector: any) => T);

export interface NgxsTesting {
    readonly store: Store;
    readonly getTestBed: TestBedStatic;
    readonly snapshot: SnapshotFn;
    readonly dispatch: DispatchFn;
    readonly selectSnapshot: SelectSnapshotFn;
    readonly select: SelectFn;
    readonly selectOnce: SelectFn;
    readonly reset: ResetFn;
    readonly getStateContextMocks: StateContextMap;
}
