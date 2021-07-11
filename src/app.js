import { useCallback, useEffect, useMemo } from 'react';
import { withCounter, useCounter } from './counter';

const Counter = () => {
    const [{ count }, { increment }] = useCounter();
    return (
        <>
            <span>current: {count}</span>
            <button onClick={increment} style={{ marginLeft: 20 }}>
                Increment
            </button>
        </>
    );
};

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

const Parent = ({ hoc }) => {
    useEffect(() => {
        console.log('Parent mount.');
        return () => {
            console.log('Parent unmount.');
        };
    }, []);

    const PChild1 = useCallback(hoc((props) => <Child {...props} childId="PChild_withcallback" />), [hoc]);
    const PChild2 = hoc((props) => <Child {...props} childId="PChild" />);
    const PChild3 = useMemo(() => hoc((props) => <Child {...props} childId="PChild_withmemo" />), [hoc]);

    return (
        <>
            <PChild2 />
            <PChild1 />
            <PChild3 />
        </>
    );
};

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
            <PChild2 />
            <PChild1 />
            <PChild3 />
        </>
    );
});

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
            <PChild2 />
            <PChild1 />
            <PChild3 />
        </>
    );
});

export const App = () => (
    <>
        <Counter />
        <br />
        <div>-- Parent</div>
        <Parent hoc={withCounter} />
        <br />
        <div>-- Parent With Counter</div>
        <ParentWithCounter hoc={withCounter} />
        <br />
        <div>-- Parent With Counter (pass count to children)</div>
        <ParentWithCounterPassCount hoc={withCounter} />
    </>
);
