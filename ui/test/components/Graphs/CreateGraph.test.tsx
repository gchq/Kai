import {mount} from 'enzyme';
import CreateGraph from "../../../src/components/Graphs/CreateGraph";
import React from 'react';

describe('When CreateGraph dialog mounts', () => {
    const wrapper = mount(<CreateGraph/>);
    it('should have a Create Graph title' , () => {
        const title = wrapper.find('h2');
        expect(title).toHaveLength(1);
        expect(title.text()).toBe('Create Graph')

    });
    it('should have a Graph Id text field', () => {
        const textfield= wrapper.find('input');
        expect(textfield).toHaveLength(1);
    });
    it('should have a Schema text area', () => {
        const textfield= wrapper.find('textarea');
        expect(textfield).toHaveLength(1);
    });
    it('should have a Submit button', () => {
        const submitButton= wrapper.find('button').at(2).text();
        expect(submitButton).toBe("Submit");
    });
    it('should have a close icon button', () => {
        const closeButton= wrapper.find('button').at(1).find('svg');
        expect(closeButton).toHaveLength(1);
        // console.log(closeButton);
    })

});


