import React from 'react';
import { Button, Card, CardActions, CardContent, Grid, makeStyles, Toolbar, Typography } from '@material-ui/core';
import ReactJson from 'react-json-view';
import GitHubIcon from '@material-ui/icons/GitHub';

export default class UserGuide extends React.Component<{}, {}> {
    constructor(props: object) {
        super(props);
    }

    private classes: any = makeStyles((theme) => ({
        root: {
            width: '100%',
        },
        heading: {
            fontSize: theme.typography.pxToRem(15),
            fontWeight: theme.typography.fontWeightRegular,
        },
        card: {
            maxWidth: 345,
        },
    }));

    private getExampleSchema(): object {
        return {
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
    }

    public render() {
        return (
            <main>
                <Toolbar />
                <Grid container justify="center" className={this.classes.root} style={{ marginTop: 30 }}>
                    <Card className={this.classes.card} style={{ maxWidth: 800 }}>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                                Add Graphs
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                When creating a new graph you need a unique Graph Name and a Schema. Type in a unique
                                name in the Graph Name text field. In the Schema textarea, type in a valid schema with
                                elements and types.
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                You can import a schema by clicking the document icon. You can only import a single JSON
                                file. You can remove your uploaded schema by clicking on the clear icon next to the name
                                of your file in the selected files section.
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                Once you exit the dialog box, your imported schema will appear in the schema textarea.
                                You can edit the imported schema by typing in the Schema textarea.
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                Click Add Graph to add your graph. If your schema is invalid, it will give you an error.
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                Note: Make sure your schema has elements and types and is surrounded by curly brackets(
                                {'{}'}).
                            </Typography>
                        </CardContent>

                        <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                                View Graphs
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                View your graphs in the View Graphs section.
                            </Typography>
                        </CardContent>

                        <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                                Schema
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                A schema can be split into two parts: elements and types.
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                Example Schema:
                            </Typography>
                            <ReactJson
                                src={this.getExampleSchema()}
                                theme="summerfruit:inverted"
                                displayDataTypes={false}
                                displayObjectSize={false}
                                name={'schema'}
                            />
                        </CardContent>

                        <CardActions style={{ justifyContent: 'center' }}>
                            <Button
                                startIcon={<GitHubIcon />}
                                variant="contained"
                                color="primary"
                                target="_blank"
                                href="https://gchq.github.io/gaffer-doc/summaries/getting-started.html"
                            >
                                Gaffer Documentation
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </main>
        );
    }
}
