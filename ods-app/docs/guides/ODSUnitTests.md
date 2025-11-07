# ODS Unit Testing Guide

# Test Framework

This project has implemented the Jest framework for unit testing. For more information on Jest, please refer to the [Jest documentation](https://jestjs.io/docs/getting-started).

## Implementation

Server Tests are run in the `node` environment using the jest framework. These tests are located under the `__tests__` directory in the `/code/src` folder.

UI tests are run by simulating a browser environment using the `jsdom` library. As we are configured to use the `node` environment for the server components we will add the following to our UI tests `/** @jest-environment jsdom */` which will allow us to utilize both environments. These tests are located under the `__tests__` directory in the `/code/src/ui/src` folder.

The tests are run using the command:

```npm run test```


## Mocks

Mocks are used in Jest to replace real implementations with mock functions or objects, allowing you to isolate the code being tested and control its behavior.

### Mocking Functions

**Using jest.fn()** - jest.fn() creates a mock function that you can customize.
```typescript
const mockFunction = jest.fn();
mockFunction.mockReturnValue('mocked value');
     
test('mock function example', () => {
    expect(mockFunction()).toBe('mocked value');
});
```

### Mocking Modules
**Using jest.mock()** - You can mock entire modules using jest.mock().
```typescript
// api.ts
export const fetchData = () => 'real data';

// test file
jest.mock('./api', () => ({
  fetchData: jest.fn(() => 'mocked data'),
}));

import { fetchData } from './api';

test('mock module example', () => {
  expect(fetchData()).toBe('mocked data');
});
```

### Mocking Only Specific Functions

If you only want to mock specific functions in a module:

```typescript
import * as api from './api';

jest.spyOn(api, 'fetchData').mockReturnValue('mocked data');

test('spyOn example', () => {
  expect(api.fetchData()).toBe('mocked data');
});
```

### Mocking Asynchronous Functions

For async functions, use mockResolvedValue or mockRejectedValue.

```typescript
const mockAsyncFunction = jest.fn().mockResolvedValue('mocked async data');

test('mock async function example', async () => {
  await expect(mockAsyncFunction()).resolves.toBe('mocked async data');
});
```