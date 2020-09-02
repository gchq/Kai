import {mount} from 'enzyme';
import React from 'react';
import AddGraph from "../../src/components/AddGraph/AddGraph";
import Dropzone from 'react-dropzone'
import {fireEvent, render} from '@testing-library/react'
const wrapper = mount(<AddGraph/>);
describe('When AddGraph mounts', () => {

    it('should have a Graph Id text field', () => {
        const textfield = wrapper.find('input');
        expect(textfield.at(0).props().name).toBe("graphId");
    });
    it('should have a Schema text area', () => {
        const textfield = wrapper.find('textarea');
        expect(textfield.props().id).toBe("schema");
    });
    it('should have icon button', () => {
        const fileButton = wrapper.find('button').at(0).find('svg');
        expect(fileButton).toHaveLength(1);
    });
    it('should have a Submit button', () => {
        const submitButton = wrapper.find('button').at(2).text();
        expect(submitButton).toBe("Add Graph");
    });


});
describe('Dropzone behaviour', () => {
    function flushPromises(ui: JSX.Element, container: any) {
        return new Promise(resolve =>
            setImmediate(() => {
                render(ui, {container});
                resolve(container)
            })
        )
    }

    function dispatchEvt(node: any, type: any, data: any) {
        const event = new Event(type, {bubbles: true});
        Object.assign(event, data);
        fireEvent(node, event)
    }

    function mockData(files: Array<File>) {
        return {
            dataTransfer: {
                files,
                items: files.map(file => ({
                    kind: 'file',
                    type: file.type,
                    getAsFile: () => file
                })),
                types: ['Files']
            }
        }
    }

    it('renders the root and input nodes with the necessary props', () => {
        const {container} = render(
            <Dropzone>
                {({getRootProps, getInputProps}) => (
                    <div {...getRootProps()}>
                        <input {...getInputProps()} />
                    </div>
                )}
            </Dropzone>
        );
        expect(container.innerHTML).toMatchSnapshot()
    });
    test('runs onDragEnter when a file is dragged in component', async () => {
        const file = new File([
            JSON.stringify({ping: true})
        ], 'ping.json', {type: 'application/json'});
        const data = mockData([file]);
        const onDragEnter = jest.fn();

        const ui = (
            <Dropzone onDragEnter={onDragEnter}>
                {({getRootProps, getInputProps}) => (
                    <div {...getRootProps()}>
                        <input {...getInputProps()} />
                    </div>
                )}
            </Dropzone>
        );
        const {container} = render(ui);
        const dropzone = container.querySelector('div');

        dispatchEvt(dropzone, 'dragenter', data);
        await flushPromises(ui, container);

        expect(onDragEnter).toHaveBeenCalled()
    });
    it('runs onChange when a change happens in the component', () => {
        const inputProps = {
            onChange: jest.fn()
        };

        const ui = (
            <Dropzonea>
                {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()}>
                        <input {...getInputProps(inputProps)} />
                    </div>
                )}
            </Dropzonea>
        );

        const { container } = render(ui);
        const input = container.querySelector('input');

        fireEvent.change(input);
        expect(inputProps.onChange).toHaveBeenCalled()
    })
    it('should have an input that accepts files', () => {

        const dropZone= wrapper.find('input').at(1);
        expect(dropZone.props().type).toBe('file')
    })
    it('should only accept json files', () => {

        const dropZone= wrapper.find('input').at(1);
        expect(dropZone.props().accept).toBe('application/json')
    })


});