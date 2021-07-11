import { createStore, createHook } from 'react-sweet-state';

const Store = createStore({
    initialState: {
        count: 0,
    },
    actions: {
        increment: () => ({ setState, getState }) => {
            setState({
                count: getState().count + 1,
            });
        },
    },
    name: 'counter',
});

export const useCounter = createHook(Store);

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
