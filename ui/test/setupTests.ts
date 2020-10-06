import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

const syncify = async (fn: any) => {
    try {
        const result = await fn();
        return () => {
            return result;
        };
    } catch (e) {
        return () => {
            throw e;
        };
    }
};

export default {
    syncify,
};
