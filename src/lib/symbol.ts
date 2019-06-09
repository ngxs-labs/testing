import { Store } from '@ngxs/store';
import { ModuleWithProviders, Type } from '@angular/core';
import { TestBedStatic } from '@angular/core/testing';
import { NgxsConfig } from '@ngxs/store/src/symbols';

export interface NgxsOptionsTesting {
    states?: Type<unknown>[];
    ngxsOptions?: Partial<NgxsConfig>;
    imports?: ModuleWithProviders[];
    before?: () => void;
}

export interface NgxsTesting {
    store: Store;
    getTestBed: TestBedStatic;
}
