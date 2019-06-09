import { NgxsAfterBootstrap, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { NgxsTestBed } from '../lib/ngxs.setup';

describe('Full testing NGXS States with NgxsTestBed', () => {
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

    it('should be correct testing lifecycle with NgxsTestBed', () => {
        const { store } = NgxsTestBed.configureTestingStates({ states: [AppState] });
        expect(store.snapshot()).toEqual({
            app: {
                'AppState.ngxsOnInit': true,
                'AppState.ngxsAfterBootstrap': true,
                count: 2
            }
        });
    });
});
