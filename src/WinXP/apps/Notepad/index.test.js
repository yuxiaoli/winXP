import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { createHash } from 'crypto';
import Notepad from './index';

it('uses the approved welcome only for new windows and preserves edited or empty mounted documents', () => {
  const first = document.createElement('div');
  const second = document.createElement('div');
  document.body.append(first, second);
  function render(container) {
    act(() => {
      ReactDOM.render(<Notepad onClose={() => {}} />, container);
    });
  }
  function expectApprovedWelcome(container) {
    const text = container.querySelector('textarea').value;
    expect(Buffer.byteLength(text, 'utf8')).toBe(525);
    expect(
      createHash('sha256')
        .update(text, 'utf8')
        .digest('hex'),
    ).toBe('8cfade6f56f8046d1a2deae329e43d3f024095917d18dc11e436b095d9c9fb36');
  }
  try {
    render(first);
    expectApprovedWelcome(first);
    const editor = first.querySelector('textarea');
    act(() => {
      Simulate.change(editor, { target: { value: 'My own draft\n' } });
    });
    render(first);
    expect(editor.value).toBe('My own draft\n');
    act(() => {
      Simulate.change(editor, { target: { value: '' } });
    });
    render(first);
    expect(editor.value).toBe('');
    render(second);
    expectApprovedWelcome(second);
    expect(editor.value).toBe('');
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(first);
      ReactDOM.unmountComponentAtNode(second);
    });
    first.remove();
    second.remove();
  }
});
