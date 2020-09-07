import {mount} from 'enzyme';
import React from 'react';
import AddGraph from "../../src/components/AddGraph/AddGraph";
import {DropzoneArea} from 'material-ui-dropzone'
import Dropzone from 'react-dropzone'
import {fireEvent, render} from '@testing-library/react'
import { act } from 'react-dom/test-utils';
const wrapper = mount(<AddGraph/>);
describe('When AddGraph mounts', () => {

    it('should have a Graph Id text field', () => {
        const textfield = wrapper.find('input');
        expect(textfield.at(0).props().name).toBe("graphName");
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
    it("should fire onChange handler", () => {
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

        const dropZone= wrapper.find('input').at(1);
        expect(dropZone.props().type).toBe('file')
    })
    it('should only accept json files', () => {

        const dropZone= wrapper.find('input').at(1);
        expect(dropZone.props().accept).toBe('application/json')
    })
   
    

});