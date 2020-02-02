import { TestBed } from '@angular/core/testing';
import { NgxsTestingModule } from '@ngxs-labs/testing';
import { State, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';

describe('Simple', () => {
    @State({
        name: 'app',
        defaults: [1, 2]
    })
    @Injectable()
    class AppState {}

    it('should be provide', () => {
        TestBed.configureTestingModule({
            imports: [NgxsTestingModule.forRoot([AppState])]
        });

        const store: Store = TestBed.get(Store);

        expect(store.snapshot()).toEqual({ app: [1, 2] });
    });
});
