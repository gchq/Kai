import {mount} from 'enzyme';
import ExampleTable from '../../../src/components/ViewGraph/ViewGraph';
import React from 'react';
import { render } from '@testing-library/react';
import { createRenderer } from 'react-dom/test-utils';

describe('When ExampleTable mounts', () => {
    const wrapper = mount(<ExampleTable/>);
    const rows = wrapper.find('tbody').find('tr');

    it('should display only 1 table element', () => {
        const table = wrapper.find('table');
        expect(table).toHaveLength(1);
    });
    
    it('should display only 3 columns in the table element', () => {
        const tableHead = wrapper.find('th');
        expect(tableHead).toHaveLength(3);
    });

    it('should display Graph Id and Current State Columns', () => {
        const cols = [
            {name: 'Graph Name'},
            {name: 'Current State'},
            {name: 'Delete'}
        ];
        const tableHead = wrapper.find('th');
        tableHead.forEach((th, idx) => {
            expect(th.text()).toEqual(cols[idx].name);
        });
    });

    it('should only have 1 table body', () => {
        const tableBody = wrapper.find('tbody');
        expect(tableBody).toHaveLength(1);
    });

    it('should get all the graphs and display it in the table', () => { 
        rows.forEach(() => {
            const cells = rows.find('td');
            expect(cells.at(0).text()).toEqual("testId1");
            expect(cells.at(1).text()).toEqual("deployed");
            expect(cells.at(2).text()).toEqual("Delete");
        });
    });

    it('should have Delete button in each row', () => {
        rows.forEach(() => {
            const cells = rows.find('td');
            expect(cells.at(0).find('svg')).toHaveLength(1);
            expect(cells.at(1).find('svg')).toHaveLength(1);
            expect(cells.at(2).find('svg')).toHaveLength(1);
        });
    });
});
