import { mount, ReactWrapper } from 'enzyme';
import React from 'react';
import UserLogin from '../../../src/components/UserLogin/UserLogin'

let wrapper: ReactWrapper;
beforeEach(() => (wrapper = mount(<UserLogin />)));
afterEach(() => wrapper.unmount());

describe('On Render', () => {
    it('should have a username input field', () => {
        const inputfield = wrapper.find('input');
        expect(inputfield.at(0).props().name).toBe('username');
    });
    it('should have a password input field', () => {
        const textfield = wrapper.find('input');
        expect(textfield.at(1).props().name).toBe('password');
    });
    it('should have a sign in button', () => {
        const submitButton = wrapper.find('button').at(0).text();
        expect(submitButton).toBe('Sign In');
    });
});