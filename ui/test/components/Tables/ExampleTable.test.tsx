import { shallow } from 'enzyme';
import ExampleTable from '../../../src/components/Tables/ExampleTable';
import React from 'react';

describe('When ExampleTable mounts', ()=> {
    it('should get and display all graphs', ()=>{
        const wrapper = shallow(<ExampleTable />);
        
        expect(wrapper.find('').html()).toEqual('owenfiwof');
    });
});
