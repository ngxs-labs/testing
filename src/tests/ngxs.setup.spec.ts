import { Action, NgxsAfterBootstrap, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { NgxsTestBed } from '../lib/ngxs.setup';

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
