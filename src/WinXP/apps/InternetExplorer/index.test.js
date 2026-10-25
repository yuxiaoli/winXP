import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import InternetExplorer from './index';

it('opens Sean’s start page, keeps the search demo usable, and returns Home', () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  try {
    act(() => {
      ReactDOM.render(<InternetExplorer onClose={() => {}} />, container);
    });
    expect(
      container.querySelector('a[href="https://vectorindex.cloud"]'),
    ).not.toBeNull();
    const searchButton = [...container.querySelectorAll('button')].find(
      button => button.textContent === 'Try the search demo',
    );
    act(() => Simulate.click(searchButton));
    const input = container.querySelector('#search');
    act(() => Simulate.change(input, { target: { value: 'developer tools' } }));
    act(() => Simulate.keyDown(input, { key: 'Enter' }));
    expect(container.querySelector('#search-in-content').textContent).toBe(
      'developer tools',
    );
    act(() => Simulate.click(container.querySelector('[title="Home"]')));
    expect(container.textContent).toContain('Yuxiao Li');
    expect(
      container.querySelector('a[href="https://github.com/yuxiaoli/winXP"]'),
    ).not.toBeNull();
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    container.remove();
  }
});
