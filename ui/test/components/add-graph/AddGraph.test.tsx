import { mount, ReactWrapper } from 'enzyme';
import React from 'react';
import AddGraph from '../../../src/components/AddGraph/AddGraph';
import { DropzoneArea } from 'material-ui-dropzone';
import { CreateGraphRepo } from '../../../src/rest/repositories/create-graph-repo';
jest.mock('../../../src/rest/repositories/create-graph-repo');

let wrapper: ReactWrapper;
beforeEach(() => wrapper = mount(<AddGraph />));
afterEach(() => wrapper.unmount())

const exampleJSON = {
    elements: {
        edges: {
            BasicEdge: {
                source: 'vertex',
                destination: 'vertex',
                directed: 'true',
                properties: {
                    count: 'count',
                },
            },
        },
    },
    types: {
        types: {
            vertex: {
                class: 'java.lang.String',
            },
            count: {
                class: 'java.lang.Integer',
                aggregateFunction: {
                    class: 'uk.gov.gchq.koryphe.impl.binaryoperator.Sum',
                },
            },
            true: {
                description: 'A simple boolean that must always be true.',
                class: 'java.lang.Boolean',
                validateFunctions: [
                    {
                        class: 'uk.gov.gchq.koryphe.impl.predicate.IsTrue',
                    },
                ],
            },
        },
    },
};

describe('When AddGraph mounts', () => {
    it('should have a Graph Id text field', () => {
        const textfield = wrapper.find('input');
        expect(textfield.at(0).props().name).toBe('graphName');
    });
    it('should have a Schema text area', () => {
        const textfield = wrapper.find('textarea');
        expect(textfield.props().id).toBe('schema');
    });
    it('should have icon button', () => {
        const fileButton = wrapper.find('button').at(0).find('svg');
        expect(fileButton).toHaveLength(1);
    });
    it('should have a Submit button', () => {
        const submitButton = wrapper.find('button').at(2).text();
        expect(submitButton).toBe('Add Graph');
    });
});
describe('Add graph button', () => {
    it('should give an error when the graphName and schema field is empty', () => {
        wrapper.find('button').at(2).simulate('click');

        expect(wrapper.find('div.MuiAlert-message').text()).toBe('Error(s): Graph Name is empty, Schema is empty');
    });
    it('should give an error when the graphName field is empty', () => {
        wrapper.find('textarea').simulate('change', {
            target: { value: JSON.stringify(exampleJSON) },
        });
        expect(wrapper.find('textarea').props().value).toBe(JSON.stringify(exampleJSON));

        wrapper.find('button').at(2).simulate('click');

        expect(wrapper.find('div.MuiAlert-message').text()).toBe('Error(s): Graph Name is empty');
    });
    it('should give an error when the schema field is empty', () => {
        wrapper
            .find('input')
            .at(0)
            .simulate('change', {
                target: { value: 'testGraph' },
            });
        expect(wrapper.find('input').at(0).props().value).toBe('testGraph');

        wrapper.find('button').at(2).simulate('click');

        expect(wrapper.find('div.MuiAlert-message').text()).toBe('Error(s): Schema is empty');
    });
});
describe('Dropzone behaviour', () => {
    it('should fire onChange handler', () => {
        const handleDropzoneChange = jest.fn();
        const dzwrapper = mount(
            <DropzoneArea
                showPreviews={true}
                onChange={handleDropzoneChange}
                showPreviewsInDropzone={false}
                useChipsForPreview
                previewText="Selected files"
                clearOnUnmount={true}
                acceptedFiles={['application/json']}
                filesLimit={1}
            />
        );
        // find the DropzoneArea node
        const dropzoneAreaWrapper = dzwrapper.find(DropzoneArea);
        // call its onChange prop
        dropzoneAreaWrapper.prop('onChange')();
        // check handleDropzoneChange has been called
        expect(handleDropzoneChange).toHaveBeenCalled();
    });

    it('should have an input that accepts files', () => {
        const dropZone = wrapper.find('input').at(1);
        expect(dropZone.props().type).toBe('file');
    });
    it('should only accept json files', () => {
        const dropZone = wrapper.find('input').at(1);
        expect(dropZone.props().accept).toBe('application/json');
    });
});

describe('On Submit Request', () => {
    it('should display success message in the NotificationAlert', async () => {
        CreateGraphRepo.mockImplementationOnce(() => {
            return {
                create: () => {},
            };
        });

        inputGraphName('OK Graph');
        inputSchema(exampleJSON);

        clickSubmit();
        await wrapper.update();
        await wrapper.update();

        expect(wrapper.find('#notification-alert').text()).toBe('OK Graph was successfully added')
    });
    it('should display an error message with server error in the NotificationAlert when Request fails', async () => {
        CreateGraphRepo.mockImplementationOnce(() => {
            return {
                create: () => { throw new Error('500 Server Error'); },
            };
        });

        inputGraphName('Break Server');
        inputSchema(exampleJSON);

        clickSubmit();

        expect(wrapper.find('#notification-alert').text()).toBe('Failed to Add \'Break Server\' Graph: 500 Server Error')
    });
});

function inputGraphName(graphName: string): void {
    wrapper
        .find('input#graph-name')
        .simulate('change', {
            target: { value: graphName },
        });
}

function inputSchema(schema: object): void {
    wrapper.find('textarea').simulate('change', {
        target: { value: JSON.stringify(schema) },
    });
}

function clickSubmit(): void {
    wrapper.find('button').at(2).simulate('click');
}
