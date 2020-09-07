import {mount} from 'enzyme';
import React from 'react';
import UserGuide from "../../src/components/UserGuide/UserGuide";
import ReactJson from "react-json-view";

const wrapper = mount(<UserGuide/>);

const exampleJSON= {
    "elements": {
        "edges": {
            "BasicEdge": {
                "source": "vertex",
                "destination": "vertex",
                "directed": "true",
                "properties": {
                    "count": "count"
                }
            }
        }
    },
    "types": {
        "types": {
            "vertex": {
                "class": "java.lang.String"
            },
            "count": {
                "class": "java.lang.Integer",
                "aggregateFunction": {
                    "class": "uk.gov.gchq.koryphe.impl.binaryoperator.Sum"
                }
            },
            "true": {
                "description": "A simple boolean that must always be true.",
                "class": "java.lang.Boolean",
                "validateFunctions": [
                    {
                        "class": "uk.gov.gchq.koryphe.impl.predicate.IsTrue"
                    }
                ]
            }
        }
    }};

describe('When UserGuide mounts', () => {
    it('there should be a Gaffer Documentation button ', () => {
        const button = wrapper.find('a').at(26);
        expect(button.text()).toBe("Gaffer Documentation")

    });
    it('the Gaffer Documentation button should link to the correct gaffer doc link ', () => {
        const button = wrapper.find('a').at(26);
        expect(button.props().href).toBe("https://gchq.github.io/gaffer-doc/summaries/getting-started.html")

    });
    it('should display example schema correctly ', () => {
        const exampleSchema = wrapper.find('div.react-json-view');

        const display= mount(<ReactJson src={exampleJSON} theme="summerfruit:inverted" displayDataTypes={false} displayObjectSize={false} name={"schema"}/>)
        expect(exampleSchema).toHaveLength(1);
        expect(exampleSchema.html()).toBe(display.html())
    });
});
