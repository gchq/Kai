import {mount} from 'enzyme';
import ExampleTable from '../../../src/components/Graphs/ExampleTable';
import React from 'react';

describe('When ExampleTable mounts', () => {
    const wrapper = mount(<ExampleTable/>);

    it('should display only 1 table element', () => {
        const table = wrapper.find('table');
        expect(table).toHaveLength(1);
    });
    it('should display only 2 columns in the table element', () => {
        const tableHead = wrapper.find('th');
        expect(tableHead).toHaveLength(2);
    });
    it('should display Graph Id and Current State Columns', () => {
        const cols = [
            {name: 'Graph ID'},
            {name: 'Current State'},
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
    it('should get all the graphs and display it in the table', () =>{
        const rows = wrapper.find('tbody').find('tr');
        // expect(rows).toHaveLength(1);
        rows.forEach((tr, rowIndex) => {
            const cells = rows.find('td');
            expect(cells.at(0).text()).toEqual("testId1");
            expect(cells.at(1).text()).toEqual("deployed");
        })
    })
});
