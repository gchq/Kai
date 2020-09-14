import { mount } from 'enzyme';
import NavigationAppbar from '../../../src/components/Navigation/NavigationAppbar';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

describe('Navigation Appbar Component', () => {

    const wrapper = mount(
        <MemoryRouter>
            <NavigationAppbar />
        </MemoryRouter>);

    it('should display appbar ', () => {
        const appbar = wrapper.find('h6');
        expect(appbar).toHaveLength(1);
        expect(appbar.text()).toEqual('Graph As Service');
    });

    it('should show user id and email in Navbar', () => {
        const NavUl = wrapper.find('ul').at(0);
        const UserIcon = NavUl.find('svg');

        expect(NavUl.find('span').text()).toEqual('User');
        expect(NavUl.find('p').text()).toEqual('someuser@mail.com');
        expect(UserIcon).toHaveLength(1);
    });

    it('should display menu in Navbar', () => {
        const cols = [
            { name: 'Add Graph' },
            { name: 'View Graph' },
            { name: 'User Guide' }
        ];
        const NavLi = wrapper.find('li').at(1);
        NavLi.forEach((li, idx) => {
            const NavIcon = li.find('svg');
            expect(li.text()).toEqual(cols[idx].name);
            expect(NavIcon).toHaveLength(1);

        });
    });

    it('should have navigation link in each list item', () => {
        const Target = [
            { href: '/AddGraph' },
            { href: '/ViewGraph' },
            { href: '/UserGuide' }
        ];
        const NavUl = wrapper.find('ul').at(1);

        NavUl.forEach((NavUl, idx) => {
            const anchor = NavUl.find('a').at(idx);
            const getAttribute = anchor.getDOMNode().getAttribute('href');
            expect(getAttribute).toBe(Target[idx].href)
        });
    });
});
