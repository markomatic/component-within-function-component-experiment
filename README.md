# Defining component within function component

This experiment is testing if child component can be defined within render of another component. Main goal is to test when such child component will be remounted.

Main reason for the experiment is the fact that some react applications are using legacy HOCs that dynamically passes props to the components. Theoretically HOCs can be replaced by hooks in function components, however, because of the legacy reasons and complications in doing so, engineers are still keen to use HOCs, and sometimes to satisfy new architectures, HOCs needs to be passed as a props/component dependency.

Experiment will run 3 types of parent components:
- parent that does not re-render and doesn't pass props to child
- parent that re-renders and doesn't pass props to child
- parent that re-renders and passes props to child

"Parent that doesn't re-render and passes props to child" is impossible case, as that type of parent doesn't have access to value that would be passed to the child component.

Another part of the experiment is child component. Each of the parents above will have 3 child components:
- child that is not memoized, but is purely defined within parent function component
- child that is memoized using `useCallback` hook
- child that is memoized using `useMemo` hook

## withCounter HOC

For the purpose of the experiment we will have HOC `withCounter` that passes `count` value into the component. `count` will be stored value that will be incremented by executing some action:

```
export const withCounter = (Component) => {
  const CounterComponent = (props) => {
    const [{ count }, { increment }] = useCounter();
    return (
      <Component
        count={count}
        increment={increment}
        {...props}
      />
    );
  }

  return CounterComponent;
};
```

## Structure of every child component

Child component will be structured in the way that it just receives `count` prop which will be displayed on the page, and at the same time will use `useEffect` hook to simulate mount/unmount event:

```
const Child = ({ count, childId }) => {
  useEffect(() => {
    console.log(`${childId} mount.`);
    return () => {
      console.log(`${childId} unmount.`);
    };
  }, [childId]);

  return (
    <div>
      {childId}: {count}
    </div>
  );
};
```

## Parent that does not re-render and doesn't pass props to child

This component will be parent component that renders 3 types of children, however this component itself will not be re-rendered when `count` changes. 3 of its' children will be defined within render by passing `Child` component into the `hoc` (`hoc` is reference to `withCounter` HOC):

```
const Parent = ({ hoc }) => {
  useEffect(() => {
    console.log('Parent mount.');
    return () => {
      console.log('Parent unmount.');
    };
  }, []);

  const PChild1 = useCallback(hoc((props) => <Child  {...props}  childId="PChild_withcallback" />), [hoc]);
  const PChild2 = hoc((props) => <Child {...props} childId="PChild" />);
  const PChild3 = useMemo(() => hoc((props) => <Child {...props} childId="PChild_withmemo" />), [hoc]);

  return (
    <>
      <PChild2  />
      <PChild1  />
      <PChild3  />
    </>
  );
};
```

## Parent that re-renders and doesn't pass props to child

Same as above, this component will be parent component that renders 3 types of children, however this component itself will be re-rendered when `count` changes. We will achieve that by wrapping parent itself to the same `withCounter` HOC that are children wrapped with. Children will be defined same way as they were in the previous parent:

```
const ParentWithCounter = withCounter(({ hoc }) => {
  useEffect(() => {
    console.log('ParentWithCounter mount.');
    return () => {
      console.log('ParentWithCounter unmount.');
    };
  }, []);

  const PChild1 = useCallback(hoc((props) => <Child {...props} childId="PWCChild_withcallback" />), [hoc]);
  const PChild2 = withCounter((props) => <Child {...props} childId="PWCChild" />);
  const PChild3 = useMemo(() => hoc((props) => <Child {...props} childId="PWCChild_withmemo" />), [hoc]);

  return (
    <>
      <PChild2  />
      <PChild1  />
      <PChild3  />
    </>
  );
});
```

## Parent that re-renders and passes props to child

Same as previous parent, this component will be re-rendered when `count` changes, and same as both previous parents, it will render 3 types of children. However this component will not define children by passing them into HOC, but will rather pass `count` as a prop directly to each child. That means, it will not use "stable" reference as a memoization hook dependency, but rather unstable value, that will change between parent renders:

```
const ParentWithCounterPassCount = withCounter(({ count }) => {
  useEffect(() => {
    console.log('ParentWithCounter (pass count to children) mount.');
    return () => {
      console.log('ParentWithCounter (pass count to children) unmount.');
    };
  }, []);

  const PChild1 = useCallback(() => <Child count={count} childId="PWCChild(pass count)_withcallback" />, [count]);
  const PChild2 = () => <Child count={count} childId="PWCChild(pass count)" />;
  const PChild3 = useMemo(() => () => <Child count={count} childId="PWCChild(pass count)_withmemo" />, [count]);

  return (
    <>
      <PChild2  />
      <PChild1  />
      <PChild3  />
    </>
  );
});
```

## Root

Now is the time to display root component that will render our application. First component will be `Counter` which will have button to change the count, and the rest will be our parent components:

```
const App = () => (
  <>
    <Counter />
    <br />
    <div>-- Parent</div>
    <Parent hoc={withCounter} />
    <br />
    <div>-- Parent With Counter</div>
    <ParentWithCounter hoc={withCounter} />
    <br  />
    <div>-- Parent With Counter (pass count to children)</div>
    <ParentWithCounterPassCount  hoc={withCounter}  />
  </>
);
```

## Results

After running example, we can see initial render outputs:
```
app.js:18 PChild mount.
app.js:18 PChild_withcallback mount.
app.js:18 PChild_withmemo mount.
app.js:33 Parent mount.
app.js:18 PWCChild mount.
app.js:18 PWCChild_withcallback mount.
app.js:18 PWCChild_withmemo mount.
app.js:54 ParentWithCounter mount.
app.js:18 PWCChild(pass count) mount.
app.js:18 PWCChild(pass count)_withcallback mount.
app.js:18 PWCChild(pass count)_withmemo mount.
app.js:75 ParentWithCounter (pass count to children) mount.
```

After count is incremented, this is the next output:
```
app.js:20 PWCChild unmount.
app.js:20 PWCChild(pass count) unmount.
app.js:20 PWCChild(pass count)_withcallback unmount.
app.js:20 PWCChild(pass count)_withmemo unmount.
app.js:18 PWCChild mount.
app.js:18 PWCChild(pass count) mount.
app.js:18 PWCChild(pass count)_withcallback mount.
app.js:18 PWCChild(pass count)_withmemo mount.
```

![Sample](https://github.com/markomatic/component-within-function-component-experiment/blob/main/sample.gif?raw=true)

## Conclusion

Although it's not suggested to use HOC, but rather hooks in case of function component (as any HOC can be replaced by a hook), if someone wants to use HOC from the legacy reasons, they should still be able to if:
- HOC/child component is memoized, and
- memoization dependencies are stable references that do not change between parent renders;
