# react-mustable

A package to work with React Typescript **mutable states**.

----

## Table of Content

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
  - [1. Mustable Classes](#1-mustable-classes)
    - [1.1. `MustableBase`](#11-mustablebase)
    - [1.2. Custom Mustable Class](#12-custom-mustable-class)
    - [1.3. `mustable` decorator](#13-mustable-decorator)
      - [1.3.1. Mustable methods](#131-mustable-methods)
      - [1.3.2. Mustable Fields and Properties](#132-mustable-fields-and-properties)
      - [1.3.3. `isMustableFunction` option](#133-ismustablefunction-option)
      - [1.3.4. `snapshot` option](#134-snapshot-option)
      - [1.3.5. `sameSnapshotsChecker` option](#135-samesnapshotschecker-option)
    - [1.4. `immustable` decorator](#14-immustable-decorator)
    - [1.5. Built-in Mustable Classes](#15-built-in-mustable-classes)
  - [2. Using Mustable states](#2-using-mustable-states)
    - [2.1. `useMustableRegistry` hook](#21-usemustableregistry-hook)
    - [2.2. `register` and `remove` functions](#22-register-and-remove-functions)
    - [2.3. `useMustable` and `useNullableMustable` hook](#23-usemustable-and-usenullablemustable-hook)
    - [2.4. Mutating states using mustable members](#24-mutating-states-using-mustable-members)
      - [2.4.1. NOT the same behavior as React states](#241-not-the-same-behavior-as-react-states)
      - [2.4.2. Working normally with React Strict Mode](#242-working-normally-with-react-strict-mode)
      - [2.4.3. `version` field for dependencies list](#243-version-field-for-dependencies-list)
      - [2.4.4. `instance` field to work with other logics](#244-instance-field-to-work-with-other-logics)
      - [2.4.5. Updating nested mustable instance](#245-updating-nested-mustable-instance)
      - [2.4.6. Async operations are NOT supported](#246-async-operations-are-not-supported)
- [License](#license)

----

## Introduction

​	The benefits of **immutability** is widely proven and accepted in programming world. Although the fact is not deniable, it comes with a cost on performance. 

​	**React-mustable** tries to break the [rule of immutability of React](https://react.dev/learn/updating-objects-in-state). It offers syntactic sugar to work with mutable states, while keeping them works as perfectly as React states.

​	The word "**mustable**" is a pun on the words "mutable" and "must stable", implying the whole purposes of the package. However, from now on, whenever the word appears in this article, you can interpret it as "**mutable and observable by React**".

## Installation

````bash
npm i @cutetn/react-mustable
````
or
```bash
 yarn add @cutetn/react-mustable
```

## Usage
### 1. Mustable Classes
#### 1.1. `MustableBase`
- `MustableBase` is an abstract class to interact with `react-mustable` internal logics and React APIs.
- `MustableBase` can be imported directly from the package.

#### 1.2. Custom Mustable Class
- To utilize `react-mustable` APIs, you must create a class for your state, which *extends* `MustableBase` class.
- You can create any class members you want, including the constructor, methods, fields and properties. The only caveat is you can't access to `version` and `instance` as it is used by `react-mustable` under the hood. if you try to access these members, some editors (VSCode for instance) should warn you not to do it by marking it as *deprecated*.
```tsx
import { MustableBase } from "@cutetn/react-mustable"

class CustomMustable extends MustableBase {
  myCustomField: string;

  get myCustomProperty(): string { 
    return this.myCustomField;
  }
  set myCustomProperty(value) {
    this.myCustomField = value;
  }

  myCustomMethod() {
    console.log(this.myCustomProperty);
  }
}
```

#### 1.3. `mustable` decorator
- `mustable` decorator marks a member as a *mustable member* of a Mustable class, i.e. every access to these members can be observed by React, thus, triggering re-rendering. Therefore, you should use this decorator on every single member whose changes can effect the UI.
- A member, which is decorated by `mustable`, almost changes nothing in its behavior itself. You are free to write unit tests to the class as if it was a normal class.
- However, it is recommended that *mustable functions* **should NOT return anything**. It is because there is a different behavior when using a Mustable instance along with React APIs, which would be covered in later sections.
- First off, to use decorators in TypeScript, be sure to have your `tsconfig.json` correctly:
```json
{
  "compilerOptions": {
    "target": "es5",
    "experimentalDecorators": true
  }
}

```
> Never mind the word "experimental", Angular has been using decorators for ages.

##### 1.3.1. Mustable methods
- A *mustable method* is simply a class method decorated with `mustable`.
```tsx
import { MustableBase, mustable } from "@cutetn/react-mustable"

export class CustomMustable extends MustableBase {
  @mustable()
  myMutableMethod() {
    // do some mutation...
  }
}
```
- As said previously, you should only decorate your method with `@mustable` as long as a **method call** mutates your UI data. Also, do not return anything to avoid any confusion later on.
- If the method is not decorated with `@mustable`, you are free to return anything as the method would always act normally.

##### 1.3.2. Mustable Fields and Properties
- A *mustable field* is simply a class field decorated with `mustable`. A *mustable property* is a class property whose either `getter` or `setter` decorated with `mustable`.
```tsx
import { MustableBase, mustable } from "@cutetn/react-mustable"

export class CustomMustable extends MustableBase {
  @mustable()
  myCustomField: string = ""; 
  
  @mustable()
  get myCustomProperty(): string { 
    return this.myCustomField;
  }
  set myCustomProperty(value) {
    this.myCustomField = value;
  }
}
```
- you should only decorate your fields and properties with `@mustable` as long as **setting its value** mutates your UI data.
- Note that a mutation on a mustable member, inside of other immustable member will not be visible by the `react-mustable` system.

```tsx
import { MustableBase, mustable } from "@cutetn/react-mustable"

export class CustomMustable extends MustableBase {
  @mustable()
  myCustomField: string = ""; 
    
  mutate(value: string) {
    myCustomField = value; 
    // This won't trigger re-rendering even though "myCustomField" itself is mustable.
    // To fix this, "mutate" method must be mustable as well.
  }
}
```



##### 1.3.3. `isMustableFunction` option
- Given the scenario where you have a field whose type is a function, AND this function mutate your UI data.
```tsx
import { MustableBase, mustable } from "@cutetn/react-mustable"

export class CustomMustable extends MustableBase {
  @mustable()
  myFunctionField = () => {
    // do some mutation...
  }
}
```
- Unfortunately, a **function call** to `myFunctionField` will NOT trigger React to re-render in this case. The library only watches a *set of fields and properties* or a *method call*, not a "*field-which-is-actually-a-function call*". Therefore, by the way, a set to `myFunctionField` would be observable by React.
- If you really want this method call to trigger React to re-render, you can either refactor it into a *method*, or set the option `isMustableFunction` to `true`.

```tsx
import { MustableBase, mustable } from "@cutetn/react-mustable"

export class CustomMustable extends MustableBase {
  @mustable({
    isMustableFunction: true
  })
  myFunctionField = () => {
    // do some mutation...
  }
}
```

- Note that even with this option turned on, a set to the `myFunctionField` still trigger React to re-render.

##### 1.3.4. `snapshot` option
- A function to produce a lightweight immutable snapshot from your Mustable instance. When provided, 2 snapshots will be created before and after a mustable operation is done. React will then compare these 2 snapshots to decide if it should re-render the UI.
- The `snapshot` function accepts the first paramemter as the instance on which the mutation is functioning on. The second parameter is an array, is the list of arguments that the mutation option is called with.
- For example, if we have a method `mutateField(fieldName: string, value: string)` to mutate an internal object field `fieldName`, and another immutable method `getField(fieldName: string)` to get the field from the object. We know that the method `mutateField` only mutate `this.obj[fieldName]`, which can be obtained by `getField`. We can actually use the method `getField` to create a snapshot for `mutateField`. Notice that if the new value of `this.obj[fieldName]` is the same as its old one, a re-render would be automatically skipped, which optimize the performance for your website.
```tsx
import { MustableBase, mustable } from "@cutetn/react-mustable"

export class CustomMustable extends MustableBase {
  private obj = {};

  getField(fieldName: string) {
    return this.obj[fieldName];
  }

  @mustable({
    snapshot: (instance, args = []) => instance.getField(args[0])
  })
  mutateField(fieldName: string, value: string) {
    this.obj[fieldName] = value;
  }
}
```
- If the `snapshot` option is omitted, the system would treat it as "always changing" operation.
- Note that you always only need the public interface of your class to provide a snapshot. If a mutation does not change a thing to the public interface, how can it reflect changes to the UI?

##### 1.3.5. `sameSnapshotsChecker` option
- It's sometimes reasonable to have a custom `snapshot` comparer. Using this comparer wisely along with `snapshot` option would benefits the web's performance a lot.
- Intuitively, the `sameSnapshotsChecker` receives 2 snapshots, one before the mutation, one after, and return a boolean indicating if the 2 snapshots should be seen as identical.
```tsx
import { MustableBase, mustable } from "@cutetn/react-mustable"

class Person {
  id: string;
  name: string;
  age: number;

  isSame(other: Person) {
    return this.name === other.name && this.age === other.age
  }
}

export class CustomMustable extends MustableBase {
  private people = {};

  getPerson(id: string) {
    return this.people[id];
  }

  @mustable({
    snapshot: (instance, args = []) => instance.getPerson(args[0]),
    sameSnapshotsChecker: 
      (personBefore, personAfter) => 
        personBefore.isSame(personAfter),
  })
  mutateField(person: Person) {
    this.people[person.id] = person;
  }
}
```

- Because rewriting these comparers would be a waste of time, `react-mustable` provides some basic comparison strategy in the `sameSnapshotsCheckers` object.
  - `isAlwaysChanging`: Always return true.
  - `isShallowSame`: Shallow equality, compare values of primitive types, and references of complex types.
  - `isDeepSame`: Deep equality, compare values of primitive types, otherwise, it would compare each field nested in a complex type.
  - `isTopLevelArrayShallowSame`: If the 2 snapshots are array, it checks for shallow equality of each element in the array; check for shallow equality otherwise. This is similar to React's dependencies list comparison.
- If `sameSnapshotsChecker` option is omitted while `snapshot` is provided, the `isTopLevelArrayShallowSame` would be taken as default strategy.

#### 1.4. `immustable` decorator
- The `immustable` decorator does nothing to your members. Nonetheless, it is recommended to use this decorator as a safe checkpoint on an `immustable` member, ensuring never forgetting any `mustable` members.

#### 1.5. Built-in Mustable Classes

- `react-mustable` packages some built-in Mustable Classes. These are wrappers for JavaScript's built-in data structures, including: **`MustableArray`**, **`MustableSet`** and **`MustableMap`**.
- The usage of these classes are almost similar to its original version, with a few key differences:
  - Mutable methods return `void`.
  - An instance of `MustableArray` does not have the `[index]` operator. You must use the `at(index: number)` method instead.
  - An instance of these classes can not be iterated with spread operator (`...`). Try converting them back to JavaScript objects or use other method if possible.
  - Some other helper methods.


### 2. Using Mustable states
#### 2.1. `useMustableRegistry` hook
- This hook create a "Mustable Registry" object for your component. This object manage all mustable instances and provide functionality to add new or clean up them.
- Using this hook exactly once in your component is enough for any mustable logics, even though you could create more, it would be pointless.
- You shouldn't provide the Mustable registry object in a React context provider, as it would excessively try to re-render your entire UI hierarchy, creating a huge impact on your web's performance.

#### 2.2. `register` and `remove` functions
- `register` function of the registry object add a *wrapper* called **`React-Mustable`** instance to a Mustable instance. This instance is responsible for keeping the mustable state sync to React.
- Every mustable functions and methods of the wrapper returns `void` regardless to its original declaration in the Mustable class, even though the editor's type system suggests that the return type remains intact. This is the reason why every mustable member should return `void` to avoid this confusion.
- The first parameter of `register` is a Mustable instance to create a wrapper to. The second parameter, namely `keepRef`, tells system whether it should save the reference to the registry object to the wrapper for later use, this value defaults to `true`.
- Once the reference to wrapper is saved, every other call of `register` to the same instance would give you the same React-Mustable instance.
- To remove a saved React-Mustable wrapper instance, call `remove` function on the registry object. This function accepts either a Mustable instance or a React-Mustable instance.

```tsx
import React from "react";
import { useMustableRegistry, MustableArray } from "@cutetn/react-mustable"

function MyComponent() {
  const mustableReg = useMustableRegistry();
    
  // "mustableArray" is now actually a React-Mustable instance.
  const mustableArray = React.useMemo(() => 
    mustableReg.register(new MustableArray())
  , []);

  React.useEffect(() => {
    // Clean up the mustable instance on unmount.
    return () => mustableReg.remove(mustableArray);
  }, [])

  return <></>
}
```

#### 2.3. `useMustable` and `useNullableMustable` hook
- It can be noticed that this chunk of code (below) appears frequently as you may want to create some states for your component.
```tsx
  const mustableArray = React.useMemo(() => 
    mustableReg.register(new MustableArray())
  , []);

  React.useEffect(() => {
    return () => mustableReg.remove(mustableArray);
  }, [])
```
- The registry object has another hook `useMustable` to do all of these works.
- The code snippet given in the section 2.2 can be refactored as:
```tsx
import React from "react";
import { useMustableRegistry, MustableArray } from "@cutetn/react-mustable"

function MyComponent() {
  const mustableReg = useMustableRegistry();
    
  // "mustableArray" is actually a React-Mustable instance.
  const mustableArray = mustableReg.useMustable(
    () => new MustableArray(), 
    []
  );

  return <></>
}
```

- The first parameter is a Mustable factory, which is a function receives no parameter and returns a Mustable instance. The second parameter is the dependencies list, whenever there are some changes to this list, the factory would create another Mustable instance based on new data. This hook creates and returns a React-Mustable wrapper for the produced Mustable instance.
- Similarly, `useNullableMustable` works almost the same, except that the factory may return `null` or `undefined`; In those cases, the hook would just return the same product as the factory.

#### 2.4. Mutating states using mustable members
- Once you have got a React-Mustable instance, every interaction with mustable members of the wrapped Mustable instance would trigger React to re-render.
- Throughout this section, we are going to use the class `Worker` below:
```tsx
import { MustableBase, immustable, mustable } from "@cutetn/react-mustable";

class Worker extends MustableBase {
  constructor(name: string, manager?: Worker) {
    super();
    this.name = name;
    this.manager = manager;
  }

  @mustable({
    snapshot: (instance) => instance.name,
  })
  name: string;

  private _energy: number = 10;
  get energy() {
    return this._energy;
  }

  @mustable()
  manager?: Worker;

  @mustable({
    snapshot: (instance) => instance.energy,
  })
  work() {
    if (this.energy > 0) this._energy--;
  }

  @mustable({
    snapshot: (instance) => instance.energy,
  })
  eat() {
    if (this.energy < 10) this._energy++;
  }

  @immustable()
  toObject() {
    return {
      name: this.name,
      energy: this.energy,
      manager: this.manager?.toObject(),
    };
  }

  @immustable()
  toString() {
    return JSON.stringify(this.toObject(), null, 2);
  }
}
```
- Let's first create a simple component using `Worker` class:
```tsx
import React from "react"
import { useMustableRegistry } from "@cutetn/react-mustable"

function MyComponent() {
  const mustableReg = useMustableRegistry();
  const worker = mustableReg.useMustable(() => new Worker("Bob", new Worker("Alice")), []);

  const handleChangeWorkerName = React.useCallback((e) => {
    worker.name = e.target.value;
  }, []);

  return (
    <>
      <div style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
        {worker.toString()}
      </div>
      <div>
        <label>Worker's name: </label>
        <input onChange={handleChangeWorkerName} value={worker.name} />
      </div>
      <div>
        <button onClick={worker.eat}>{worker.name} eats</button>
      </div>
      <div>
        <button onClick={worker.work}>{worker.name} works</button>
      </div>
    </>
  );
}
```
- Notice that setting new value to `worker.name`, or calling `worker.work`, `worker.eat` would mutate the `worker` instance. The new data immediately reflects to the UI even though it does not look like a regular React's `setState`. 
- Voilà, our first working example!

##### 2.4.1. NOT the same behavior as React states
- React's `setState` does not update state immediately. Instead, the new state is only set once the rendering phase is done. [[ref]](https://react.dev/reference/react/useState#ive-updated-the-state-but-logging-gives-me-the-old-value)
- React's queue a series of `setState` for one re-render. [[ref]](https://react.dev/learn/queueing-a-series-of-state-updates)

- Let's verify these behaviors in `react-mustable`:
```tsx
import React from "react"
import { useMustableRegistry } from "@cutetn/react-mustable"

function MyComponent() {
  const mustableReg = useMustableRegistry();
  const worker = mustableReg.useMustable(() => new Worker("Bob", new Worker("Alice")), []);

  const handleTripleWork = React.useCallback(() => {
    console.log("Before works", worker.energy);
    worker.work();
    console.log("After work 1", worker.energy);
    worker.work();
    console.log("After work 2", worker.energy);
    worker.work();
    console.log("After work 3", worker.energy);
  }, []);

  console.log("rerender!");

  return (
    <>
      <div style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
        {worker.toString()}
      </div>
      <button onClick={handleTripleWork}>Triple work!</button>
    </>
  );
}
```
- After clicking on "Triple work" button 3 times, the result turns out not to be very consistent:
```
rerender!
Before works 10
After work 1 9
After work 2 9
After work 3 9
rerender!
rerender!
Before works 7
After work 1 6
After work 2 6
After work 3 6
rerender!
Before works 4
After work 1 4
After work 2 4
After work 3 4
rerender!
```
- Although this should be fixed in future releases, be highly aware to mutate your state during rendering.

##### 2.4.2. Working normally with React Strict Mode

- React strict mode is a React feature to prevent you from breaking React's rules, including immutability.
```tsx
import React from "react"
import { useMustableRegistry } from "@cutetn/react-mustable"

function StrictModeTest() {
  const [a, setA] = React.useState<number[]>([]);
  const [b, setB] = React.useState<number[]>([]);
  const mustableReg = useMustableRegistry();
  const c = mustableReg.useMustable(() => new MustableArray<number>(), []);

  const handlePush1 = () => {
    // immutable approach: proper way to set state
    setA((prev) => [...prev, 1]);
    // mutable approach: wrong way to set state
    setB((prev) => {
      prev.push(1);
      return prev;
    });
    // react-mustable approach
    c.push(1);
  };

  return (
    <>
      <div>a={JSON.stringify(a)}</div>
      <div>b={JSON.stringify(b)}</div>
      <div>c={JSON.stringify(c.toArray())}</div>
      <button onClick={handlePush1}>PUSH 1</button>
    </>
  );
}
```
- Try rendering the component above under `React.StrictMode` then click on the "PUSH 1" button, you will see an unexpected behavior of **b**. That is because React would execute the set state function twice under Strict Mode, ensuring no mutation is made during this phase. However, `react-mustable` completely dealt with the problem by enforcing the mustable operation to run **exactly once**. Feel free to turn on Strict Mode during your development!

##### 2.4.3. `version` field for dependencies list
- Let's say we have a React-mustable instance `worker`, and a greeting sentence that should be re-calculate only when `worker` changes. The regular solution is the `React.useMemo` hook.
```tsx
const greetingWorker = React.useMemo(() => 
  `Good morning, ${worker.name}, your energy is ${worker.energy}`
, [worker]);
```
- However, in this case, worker is just **the same instance with mutable data**, which means React itself cannot knowledge changes of `worker`, therefore the value of `greetingWorker` would never change!
- The trick is pretty simple, just use field `version` from `worker` as it is updated whenever a mustable operation is done on `worker`. 
```tsx
const greetingWorker = React.useMemo(() => 
  `Good morning, ${worker.name}, your energy is ${worker.energy}`
, [worker.version]);
```

##### 2.4.4. `instance` field to work with other logics
- You can get the Mustable instance out of a React-mustable instance from the field `instance`. This allows you to do pass the Mustable instance into other functions.
> Just remember not to mutate any data on the Mustable instance itself as React will not be able to observe the changes.

##### 2.4.5. Updating nested mustable instance
- To mutate a nested member of an Mustable instance, which is another Mustable instance, you must first create a React-mustable wrapper for that instance with the `register` function.
- For example, this piece of code demonstrates how you can set the name of a worker's manager:
```tsx
import React from "react"
import { useMustableRegistry } from "@cutetn/react-mustable"

function MyComponent() {
  const mustableReg = useMustableRegistry();
  const worker = mustableReg.useMustable(() => new Worker("Bob", new Worker("Alice")), []);

  const handleChangeManagerName = React.useCallback((e) => {
    mustableReg.register(worker.manager!).name = e.target.value;
  }, []);

  return (
    <>
      <div style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{worker.toString()}</div>
      <div>
        <label>Manager's name: </label>
        <input onChange={handleChangeManagerName} value={worker.manager!.name} />
      </div>
    </>
  );
}
```

##### 2.4.6. Async operations are NOT supported
- Despite being considered, async operations are not going to be supported in `react-mustable`. That is because mutability could cause many unexpected result in the nature of asynchronous logics.
- It is recommended that async operations should be implemented in your components and effects, not in the Mustable classes themselves.

## License
[MIT License](https://github.com/CuteTN/react-mustable/blob/main/LICENSE)