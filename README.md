<p align="center">
  <img src="https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/logo.png">
</p>

---

## NGXS Testing

```
$ npm install @ngxs-labs/testing --save-dev
```

- [Introduction](#introduction)
    - [Simple example](#simple-example)

### Introduction

`@ngxs-labs/testing` is package for configures and initializes environment for ngxs unit testing and provides methods for creating states in unit tests.

### Simple example

Unit testing is easy with NGXS. 

```ts
import { NgxsTestBed } from '@ngxs-labs/testing';

describe('Zoo', () => {

  it('it toggles feed', async(() => {
    const { selectSnapshot, dispatch } = NgxsTestBed.configureTestingStates({ states: [ ZooState ] });
  
    dispatch(new FeedAnimals());
    const feed = selectSnapshot(state => state.zoo.feed);
    
    expect(feed).toBe(true);
  }));
  
});
```
