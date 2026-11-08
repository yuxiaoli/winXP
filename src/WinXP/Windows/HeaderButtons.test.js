import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import HeaderButtons from './HeaderButtons';

it('activates controls through click, not mouse release, and disables unavailable maximize', () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const onClose = jest.fn();
  const onMinimize = jest.fn();
  const onMaximize = jest.fn();
  try {
    act(() => {
      ReactDOM.render(
        <HeaderButtons
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          resizable={false}
        />,
        container,
      );
    });
    const close = container.querySelector('.header__button--close');
    act(() => {
      close.dispatchEvent(
        new MouseEvent('mouseup', { bubbles: true, button: 2 }),
      );
    });
    expect(onClose).not.toHaveBeenCalled();
    act(() => close.click());
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(close.getAttribute('aria-label')).toBe('Close');
    act(() => container.querySelector('.header__button--minimize').click());
    expect(onMinimize).toHaveBeenCalledTimes(1);
    const maximize = container.querySelector('.header__button--maximize');
    expect(maximize.disabled).toBe(true);
    act(() => maximize.click());
    expect(onMaximize).not.toHaveBeenCalled();
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    container.remove();
  }
});
