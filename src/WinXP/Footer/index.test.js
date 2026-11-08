import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import Footer from './index';

it('toggles Start by click, ignores its own outside event, and dismisses on outside pointer or Escape', () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const openApp = jest.fn();
  try {
    act(() => {
      ReactDOM.render(
        <Footer apps={[]} onMouseDown={() => {}} onClickMenuItem={openApp} />,
        container,
      );
    });
    const start = container.querySelector('.footer__start');
    const menu = () =>
      container.querySelector('.footer__start__menu').firstChild;
    expect(start.tagName).toBe('BUTTON');
    act(() => start.click());
    expect(menu()).not.toBeNull();
    expect(start.getAttribute('aria-expanded')).toBe('true');
    act(() => {
      start.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    });
    expect(menu()).not.toBeNull();
    act(() => start.click());
    expect(menu()).toBeNull();
    act(() => start.click());
    act(() => {
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    });
    expect(menu()).toBeNull();
    act(() => start.click());
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    });
    expect(menu()).toBeNull();
    act(() => start.click());
    const notepad = Array.from(container.querySelectorAll('.menu__item')).find(
      el => el.textContent === 'Notepad',
    );
    act(() => notepad.click());
    expect(openApp).toHaveBeenCalledWith('Notepad');
    expect(menu()).toBeNull();
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    container.remove();
  }
});
