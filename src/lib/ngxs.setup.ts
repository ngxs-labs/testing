import 'core-js/es6/reflect';
import 'core-js/es7/reflect';
import 'zone.js/dist/zone';

import { ApplicationRef, Type } from '@angular/core';
import { TestBed, TestBedStatic } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { ɵBrowserDomAdapter as BrowserDomAdapter, ɵDomAdapter as DomAdapter } from '@angular/platform-browser';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NgxsModule, StateContext, Store } from '@ngxs/store';

import { NgxsTestModule } from './helpers/ngxs-test.module';
import {
    DispatchFn,
    NgxsOptionsTesting,
    NgxsTesting,
    ResetFn,
    SelectFn,
    SelectSnapshotFn,
    SnapshotFn,
    StateContextMap
} from './symbol';
import { NGXS_STATE_CONTEXT_FACTORY } from '@ngxs/store/internals';
import { of } from 'rxjs';
import { MappedStore } from '@ngxs/store/src/internal/internals';

export class NgxsTestBed {
    public static configureTestingStates(options: NgxsOptionsTesting): NgxsTesting {
        function getStateCtxMocks(states: Type<unknown>[]): StateContextMap {
            function createMockStateContext<T>(stateClass: Type<unknown>): StateContext<T> {
                const { defaults, name } = stateClass['NGXS_OPTIONS_META'];
                const store: Store = TestBed.get(Store);

                return {
                    getState: jest.fn().mockImplementation(() => defaults),
                    setState: jest.fn().mockImplementation((val: T) => {
                        store.reset({ [name]: val });
                    }),
                    patchState: jest.fn().mockImplementation((val: Partial<T>) => {
                        store.reset({ [name]: { ...defaults, ...val } });
                    }),
                    dispatch: jest.fn().mockImplementation(() => of())
                };
            }

            function mockCreateStateContext(mocksTest: {
                [key: string]: StateContext<unknown>;
            }): (arg: unknown) => any {
                return ((state: MappedStore) => {
                    return mocksTest[state.name];
                }) as (arg: unknown) => any;
            }

            const stateContextFactory = TestBed.get(NGXS_STATE_CONTEXT_FACTORY);
            const mocks: { [key: string]: StateContext<unknown> } = states.reduce(
                (acc, state) => ({ ...acc, [state['NGXS_OPTIONS_META'].name]: createMockStateContext(state) }),
                {}
            );

            jest.spyOn(stateContextFactory, 'createStateContext').mockImplementation(mockCreateStateContext(mocks));

            return mocks;
        }

        this.resetTestBed();

        if (options.before) {
            options.before();
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsTestModule,
                NgxsModule.forRoot(options.states || [], options.ngxsOptions || {}),
                ...(options.imports || [])
            ]
        }).compileComponents();

        NgxsTestBed.ngxsBootstrap();

        return {
            get store(): Store {
                return TestBed.get(Store);
            },
            get snapshot(): SnapshotFn {
                const store: Store = TestBed.get(Store);
                return store.snapshot.bind(store);
            },
            get dispatch(): DispatchFn {
                const store: Store = TestBed.get(Store);
                return store.dispatch.bind(store);
            },
            get selectSnapshot(): SelectSnapshotFn {
                const store: Store = TestBed.get(Store);
                return store.selectSnapshot.bind(store);
            },
            get select(): SelectFn {
                const store: Store = TestBed.get(Store);
                return store.select.bind(store);
            },
            get selectOnce(): SelectFn {
                const store: Store = TestBed.get(Store);
                return store.selectOnce.bind(store);
            },
            get reset(): ResetFn {
                const store: Store = TestBed.get(Store);
                return store.reset.bind(store);
            },
            get getTestBed(): TestBedStatic {
                return TestBed;
            },
            get getStateContextMocks(): StateContextMap {
                return getStateCtxMocks(options.states || []);
            }
        };
    }

    private static ngxsBootstrap(): void {
        NgxsTestBed.createRootNode();
        NgxsTestModule.ngDoBootstrap(TestBed.get(ApplicationRef));
    }

    private static resetTestBed(): void {
        TestBed.resetTestEnvironment();
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    }

    private static createRootNode(selector = 'app-root'): void {
        const document = TestBed.get(DOCUMENT);
        const adapter: DomAdapter = new BrowserDomAdapter();

        const root = adapter.firstChild(adapter.content(adapter.createTemplate(`<${selector}></${selector}>`)));

        const oldRoots = adapter.querySelectorAll(document, selector);
        oldRoots.forEach((oldRoot) => adapter.remove(oldRoot));

        adapter.appendChild(document.body, root);
    }
}
