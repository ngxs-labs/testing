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
});
