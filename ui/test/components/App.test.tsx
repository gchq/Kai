import { Component } from 'react';
import { render } from '@testing-library/react';
import App from '../../src/components/App';
import { idText } from 'typescript';

describe('App tests', ()=>{
  it('compare values', () => {
    expect(5).toBe(5);
  });
});
