import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import WinXP from './index';

jest.mock('./apps', () => ({
  defaultAppState: [0, 1].map(id => ({
    id,
    zIndex: id,
    component: () => null,
    header: { title: `Window ${id}`, icon: '' },
    defaultSize: { width: 400, height: 300 },
    defaultOffset: { x: 50 * id, y: 50 * id },
    resizable: true,
    minimized: false,
    maximized: false,
  })),
  defaultIconState: [],
  appSettings: {},
}));

it('honors explicit window controls after desktop focus or on a background window', () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  try {
    act(() => {
      ReactDOM.render(<WinXP />, container);
    });
    const windows = () =>
      Array.from(container.querySelectorAll('.app__header'));
    act(() => {
      container
        .querySelector('footer')
        .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    // Keyboard and assistive activation emit click without first sending mousedown.
    act(() =>
      windows()[0]
        .querySelector('.header__button--close')
        .click(),
    );
    expect(windows()).toHaveLength(1);
    expect(windows()[0].textContent).toBe('Window 1');
    act(() =>
      windows()[0]
        .querySelector('.header__button--maximize')
        .click(),
    );
    expect(
      windows()[0].querySelector('.header__button--maximized'),
    ).not.toBeNull();
    act(() =>
      windows()[0]
        .querySelector('.header__button--minimize')
        .click(),
    );
    const app = windows()[0].parentElement;
    expect(getComputedStyle(app).display).toBe('none');
    act(() => container.querySelector('.footer__window').click());
    expect(getComputedStyle(app).display).toBe('flex');
    act(() =>
      windows()[0]
        .querySelector('.header__button--close')
        .click(),
    );
    expect(windows()).toHaveLength(0);
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    container.remove();
  }
});
