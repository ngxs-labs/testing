import { Action, NgxsAfterBootstrap, NgxsModule, NgxsOnInit, Select, Selector, State, StateContext } from '@ngxs/store';
import { Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgxsTestBed } from '@ngxs-labs/testing';
import { mockSelect } from '@ngxs-labs/testing/jest';

describe('Full testing NGXS States with NgxsTestBed', () => {
    it('should be correct testing lifecycle with NgxsTestBed', () => {
        @State({ name: 'app', defaults: { count: 0 } })
        class AppState implements NgxsOnInit, NgxsAfterBootstrap {
            public ngxsOnInit(ctx: StateContext<any>): void {
                this.triggerLifecycle(ctx, 'AppState.ngxsOnInit');
            }

            public ngxsAfterBootstrap(ctx: StateContext<any>): void {
                this.triggerLifecycle(ctx, 'AppState.ngxsAfterBootstrap');
            }

            private triggerLifecycle(ctx: StateContext<any>, type: string): void {
                ctx.setState((state: any) => ({ ...state, [type]: true, count: state.count + 1 }));
            }
        }

        const { store } = NgxsTestBed.configureTestingStates({ states: [AppState] });
        expect(store.snapshot()).toEqual({
            app: {
                'AppState.ngxsOnInit': true,
                'AppState.ngxsAfterBootstrap': true,
                count: 2
            }
        });
    });

    it('should be correct testing feed', async () => {
        let feed: any = null;

        class FeedAction {
            public static type = 'zoo';
            constructor(public payload: number) {}
        }

        @State({ name: 'zoo', defaults: { feed: 1 } })
        class ZooState {
            @Action(FeedAction) public update(ctx: StateContext<any>, { payload }: FeedAction) {
                ctx.setState({ feed: payload });
            }
        }

        const { dispatch, snapshot, selectSnapshot, select, selectOnce, reset } = NgxsTestBed.configureTestingStates({
            states: [ZooState]
        });

        dispatch(new FeedAction(2));
        expect(snapshot()).toEqual({ zoo: { feed: 2 } });
        expect(selectSnapshot(ZooState)).toEqual({ feed: 2 });

        dispatch(new FeedAction(3));
        select(ZooState).subscribe((state) => (feed = state));
        expect(feed).toEqual({ feed: 3 });

        dispatch(new FeedAction(4));
        selectOnce(ZooState).subscribe((state) => (feed = state));
        expect(feed).toEqual({ feed: 4 });

        reset({});
        expect(snapshot()).toEqual({});
    });

    it('should provide StateContextFactory for mocks', () => {
        const ZOO_STATE_NAME = 'zoo';
        const FOOD_STATE_NAME = 'food';

        class FeedAction {
            public static type = 'feed';
            constructor(public feedAmount: number) {}
        }

        class AddAnimalAction {
            public static type = 'addAnimal';
            constructor(public animalAmount: number) {}
        }

        class ResetAnimalAction {
            public static type = 'resetAnimal';
            constructor() {}
        }

        class CleanAction {
            public static type = 'clean';
            constructor(public cleanAmount: number) {}
        }

        @State({ name: ZOO_STATE_NAME, defaults: { animals: 1 } })
        class ZooState {
            @Action(ResetAnimalAction) public reset(ctx: StateContext<any>) {
                ctx.patchState({ animals: 0 });
                ctx.dispatch(new AddAnimalAction(2));
            }

            @Action(AddAnimalAction) public add(ctx: StateContext<any>, { animalAmount }: AddAnimalAction) {
                const state = ctx.getState();
                ctx.setState({ ...state, animals: state.animals + animalAmount });
            }
        }

        @State({ name: FOOD_STATE_NAME, defaults: { feed: 0, clean: 0 } })
        class FoodState {
            @Action(FeedAction) public feed(ctx: StateContext<any>, { feedAmount }: FeedAction) {
                const state = ctx.getState();
                ctx.setState({ ...state, feed: state.feed + feedAmount });
                ctx.dispatch(new CleanAction(feedAmount));
            }

            @Action(CleanAction) public clean(ctx: StateContext<any>, { cleanAmount }: CleanAction) {
                const state = ctx.getState();
                ctx.patchState({ ...state, clean: state.clean + cleanAmount });
            }
        }

        const { dispatch, getStateContextMocks } = NgxsTestBed.configureTestingStates({
            states: [ZooState, FoodState]
        });

        dispatch(new FeedAction(4));
        dispatch(new ResetAnimalAction());

        expect(getStateContextMocks[ZOO_STATE_NAME].patchState).toHaveBeenCalledWith({ animals: 0 });
        expect(getStateContextMocks[FOOD_STATE_NAME].patchState).not.toHaveBeenCalled();

        expect(getStateContextMocks[ZOO_STATE_NAME].setState).not.toHaveBeenCalled();
        expect(getStateContextMocks[FOOD_STATE_NAME].setState).toHaveBeenCalledWith({ feed: 4, clean: 0 });

        expect(getStateContextMocks[ZOO_STATE_NAME].getState).not.toHaveBeenCalled();
        expect(getStateContextMocks[FOOD_STATE_NAME].getState).toHaveBeenCalled();

        expect(getStateContextMocks[ZOO_STATE_NAME].dispatch).toHaveBeenCalledWith(new AddAnimalAction(2));
        expect(getStateContextMocks[ZOO_STATE_NAME].dispatch).toHaveBeenCalledTimes(1);
        expect(getStateContextMocks[FOOD_STATE_NAME].dispatch).toHaveBeenCalledWith(new CleanAction(4));
        expect(getStateContextMocks[FOOD_STATE_NAME].dispatch).toHaveBeenCalledTimes(1);
    });
});

describe('Select tests', () => {
    class FeedAction {
        public static type = 'zoo';
        constructor(public payload: number) {}
    }

    class AddAnimalsAction {
        public static type = 'add animals';
        constructor(public payload: number) {}
    }

    @State({ name: 'zoo', defaults: { feed: 0, animals: 0 } })
    class ZooState {
        @Selector()
        static feed(state: { feed: number; animals: number }) {
            return state.feed;
        }

        @Selector()
        static animals(state: { feed: number; animals: number }) {
            return state.animals;
        }

        @Action(FeedAction) public feed(ctx: StateContext<any>, { payload }: FeedAction) {
            ctx.patchState({ feed: payload });
        }

        @Action(AddAnimalsAction) public animals(ctx: StateContext<any>, { payload }: AddAnimalsAction) {
            const state = ctx.getState();
            ctx.patchState({ animals: state.animals + payload });
        }
    }

    @Component({
        template: `
            <span>{{ foodSelector$ | async }}</span>
            <p>{{ animalsSelector$ | async }}</p>
        `
    })
    class HostComponent {
        @Select(ZooState.feed) foodSelector$!: Observable<number>;
        @Select(ZooState.animals) animalsSelector$!: Observable<number>;
    }

    let foodSelectorSubject: Subject<number>;
    let animalsSelectorSubject: Subject<number>;
    let fixture: ComponentFixture<HostComponent>;
    let component: HostComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HostComponent],
            imports: [CommonModule, NgxsModule.forRoot([ZooState])]
        }).compileComponents();

        foodSelectorSubject = mockSelect(ZooState.feed);
        animalsSelectorSubject = mockSelect(ZooState.animals);

        fixture = TestBed.createComponent(HostComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should display mocked value', () => {
        foodSelectorSubject.next(1);
        animalsSelectorSubject.next(2);

        fixture.detectChanges();
        expect(component).toBeTruthy();

        const span = fixture.debugElement.query(By.css('span'));
        expect(span.nativeElement.innerHTML).toMatch('1');
        const p = fixture.debugElement.query(By.css('p'));
        expect(p.nativeElement.innerHTML).toMatch('2');
    });
});
