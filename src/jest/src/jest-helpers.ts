import { of, Subject } from 'rxjs';
import { Store } from '@ngxs/store';
import { TestBed } from '@angular/core/testing';

class NgxsJestHelper {
    private static mockedSelector: { key: any; value: Subject<any> }[] = [];

    static mockSelect<T>(selectorFn: (state: any) => T): Subject<T> {
        const store: Store = TestBed.get(Store);
        if (!jest.isMockFunction(store.select)) {
            jest.spyOn(store, 'select').mockImplementation((selector) => {
                const match = NgxsJestHelper.mockedSelector.find((s) => s.key === selector);
                if (match) {
                    return match.value;
                }
                return of();
            });
        }

        const subject = new Subject<T>();
        NgxsJestHelper.mockedSelector = [
            ...NgxsJestHelper.mockedSelector.filter((s) => s.key !== selectorFn),
            { key: selectorFn, value: subject }
        ];
        return subject;
    }
}

export const mockSelect = NgxsJestHelper.mockSelect;
