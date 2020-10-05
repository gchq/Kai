import { mount, ReactWrapper } from 'enzyme';
import React from 'react';
import UserLogin from '../../../src/components/UserLogin/UserLogin';

let wrapper: ReactWrapper;
beforeEach(() => (wrapper = mount(<UserLogin />)));
afterEach(() => wrapper.unmount());

describe('On Render', () => {
    it('should have a new username input field', () => {
        const inputfield = wrapper.find('input');
        expect(inputfield.at(0).props().name).toBe('username');
    });
    it('should have a temporary password input field', () => {
        const textfield = wrapper.find('input');
        expect(textfield.at(1).props().name).toBe('temppassword');
    });
    it('should have a new password input field', () => {
        const textfield = wrapper.find('input');
        expect(textfield.at(2).props().name).toBe('newpassword');
    });
    it('should have a username input field', () => {
        const textfield = wrapper.find('input');
        expect(textfield.at(3).props().name).toBe('username');
    });
    it('should have a password input field', () => {
        const textfield = wrapper.find('input');
        expect(textfield.at(4).props().name).toBe('password');
    });

    it('should have a Update Password button', () => {
        const submitButton = wrapper.find('button').at(0).text();
        expect(submitButton).toBe('Update Password');
    });
    it('should have a sign in button', () => {
        const submitButton = wrapper.find('button').at(1).text();
        expect(submitButton).toBe('Sign In');
    });
});

describe('Update Password Button', () => {

});

describe('Sign in Button', () => {
    it('should be disabled when Username and Password fields are empty', () => {
        expect(wrapper.find('button#sign-in-button').props().disabled).toBe(true);
    });
    it('should be disabled when Username field is empty', () => {
        inputPassword('testPassword');
        expect(wrapper.find('button#sign-in-button').props().disabled).toBe(true);
    });
    it('should be disabled when Password field is empty', () => {
        inputUsername('testUsername');
        expect(wrapper.find('button#sign-in-button').props().disabled).toBe(true);
    });
    it('should be enabled when Username and Password is inputted', () => {
        inputUsername('testUsername');
        inputPassword('testPassword');
        expect(wrapper.find('button#sign-in-button').props().disabled).toBe(false);
    });
});

function inputUsername(username: string): void {
    wrapper.find('input#username').simulate('change', {
        target: { value: username },
    });
    expect(wrapper.find('input#username').props().value).toBe(username);
}
function inputPassword(password: string): void {
    wrapper.find('input#password').simulate('change', {
        target: { value: password },
    });
    expect(wrapper.find('input#password').props().value).toBe(password);
}
