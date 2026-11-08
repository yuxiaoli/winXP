import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import useElementResize from './useElementResize';

const defaultOffset = { x: 100, y: 100 };
const defaultSize = { width: 400, height: 300 };
const boundary = { top: 1, right: 999, bottom: 699, left: 1 };

function WindowFixture({ resizable = true, bounds = boundary }) {
  const ref = useRef(null);
  const dragRef = useRef(null);
  const { offset, size } = useElementResize(ref, {
    dragRef,
    defaultOffset,
    defaultSize,
    boundary: bounds,
    resizable,
  });
  return (
    <div ref={ref} data-window data-geometry={JSON.stringify({ offset, size })}>
      <header ref={dragRef}>
        Title <button>Close</button>
      </header>
    </div>
  );
}

describe('window drag and resize lifecycle', () => {
  let container;
  let target;
  let header;

  function render(props = {}) {
    act(() => {
      ReactDOM.render(<WindowFixture {...props} />, container);
    });
    target = container.querySelector('[data-window]');
    header = target.querySelector('header');
    target.getBoundingClientRect = () => ({
      left: 100,
      top: 100,
      width: 400,
      height: 300,
      right: 500,
      bottom: 400,
    });
  }

  function mouse(element, type, x, y, options = {}) {
    const event = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      button: 0,
      buttons: type === 'mouseup' ? 0 : 1,
      ...options,
    });
    Object.defineProperties(event, {
      pageX: { value: x },
      pageY: { value: y },
      offsetX: { value: x - 100 },
      offsetY: { value: y - 100 },
    });
    act(() => {
      element.dispatchEvent(event);
    });
  }

  function geometry() {
    return JSON.parse(target.dataset.geometry);
  }

  function covers() {
    return Array.from(document.body.children).filter(
      node => node !== container,
    );
  }

  function startDrag() {
    mouse(header, 'mousedown', 200, 112);
    mouse(window, 'mousemove', 230, 142);
    expect(geometry().offset).toEqual({ x: 130, y: 130 });
    expect(covers()).toHaveLength(1);
  }

  function startResize() {
    mouse(target, 'mousemove', 499, 250);
    mouse(target, 'mousedown', 499, 250);
    mouse(window, 'mousemove', 549, 250);
    expect(geometry().size).toEqual({ width: 450, height: 300 });
    expect(covers()).toHaveLength(1);
  }

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    render();
  });

  afterEach(() => {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    container.remove();
    expect(document.body.children).toHaveLength(0);
  });

  it.each(['drag', 'resize'])(
    'removes the %s cover and movement listeners when the window loses focus',
    kind => {
      if (kind === 'drag') startDrag();
      else startResize();
      const stopped = geometry();
      act(() => {
        window.dispatchEvent(new Event('blur'));
      });
      expect(covers()).toHaveLength(0);
      mouse(window, 'mousemove', 600, 500);
      expect(geometry()).toEqual(stopped);

      // A new gesture must start at the last rendered position, not the old origin.
      mouse(header, 'mousedown', 250, 150);
      mouse(window, 'mousemove', 260, 160);
      mouse(window, 'mouseup', 260, 160);
      expect(geometry().offset).toEqual({
        x: stopped.offset.x + 10,
        y: stopped.offset.y + 10,
      });
      expect(covers()).toHaveLength(0);
    },
  );

  it('cancels a gesture when the document becomes hidden', () => {
    startDrag();
    const stopped = geometry();
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    try {
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });
      expect(covers()).toHaveLength(0);
      mouse(window, 'mousemove', 600, 500);
      expect(geometry()).toEqual(stopped);
    } finally {
      delete document.hidden;
    }
  });

  it.each(['drag', 'resize'])(
    'recovers a %s after a missed release without following the unpressed mouse',
    kind => {
      if (kind === 'drag') startDrag();
      else startResize();
      const stopped = geometry();
      mouse(window, 'mousemove', 600, 500, { buttons: 0 });
      expect(covers()).toHaveLength(0);
      expect(geometry()).toEqual(stopped);
      mouse(window, 'mousemove', 610, 510);
      expect(geometry()).toEqual(stopped);
    },
  );

  it.each([1, 2])('does not intercept non-primary button %s', button => {
    mouse(target, 'mousemove', 499, 250, { buttons: 0 });
    mouse(target, 'mousedown', 499, 250, {
      button,
      buttons: button === 1 ? 4 : 2,
    });
    mouse(window, 'mousemove', 600, 500, { buttons: button === 1 ? 4 : 2 });
    expect(covers()).toHaveLength(0);
    expect(geometry()).toEqual({ offset: defaultOffset, size: defaultSize });
  });

  it('does not cover ordinary window content or header controls', () => {
    mouse(target, 'mousedown', 300, 250);
    expect(covers()).toHaveLength(0);
    mouse(header.querySelector('button'), 'mousedown', 450, 112);
    mouse(window, 'mousemove', 460, 120);
    expect(covers()).toHaveLength(0);
    expect(geometry()).toEqual({ offset: defaultOffset, size: defaultSize });
  });

  it('can resize immediately without a preceding hover', () => {
    mouse(target, 'mousedown', 499, 250);
    mouse(window, 'mousemove', 549, 250);
    mouse(window, 'mouseup', 549, 250);
    expect(geometry().size).toEqual({ width: 450, height: 300 });
    expect(covers()).toHaveLength(0);
  });

  it.each(['drag', 'resize'])(
    'cleans up the active %s when its window unmounts',
    kind => {
      if (kind === 'drag') startDrag();
      else startResize();
      act(() => {
        ReactDOM.unmountComponentAtNode(container);
      });
      expect(covers()).toHaveLength(0);
      mouse(window, 'mousemove', 600, 500);
      mouse(window, 'mouseup', 600, 500);
      expect(covers()).toHaveLength(0);
    },
  );

  it('keeps repeated completed drags in sync with the final release coordinates', () => {
    mouse(header, 'mousedown', 200, 112);
    mouse(window, 'mousemove', 220, 132);
    mouse(window, 'mouseup', 230, 142);
    expect(geometry().offset).toEqual({ x: 130, y: 130 });
    mouse(header, 'mousedown', 230, 142);
    mouse(window, 'mousemove', 240, 152);
    mouse(window, 'mouseup', 240, 152);
    expect(geometry().offset).toEqual({ x: 140, y: 140 });
    expect(covers()).toHaveLength(0);
  });

  it.each([
    ['left', 101, 250, { x: 120, y: 100 }, { width: 380, height: 300 }],
    ['right', 499, 250, { x: 100, y: 100 }, { width: 420, height: 300 }],
    ['top', 300, 101, { x: 100, y: 130 }, { width: 400, height: 270 }],
    ['bottom', 300, 399, { x: 100, y: 100 }, { width: 400, height: 330 }],
    ['top left', 101, 101, { x: 120, y: 130 }, { width: 380, height: 270 }],
    ['top right', 499, 101, { x: 100, y: 130 }, { width: 420, height: 270 }],
    ['bottom left', 101, 399, { x: 120, y: 100 }, { width: 380, height: 330 }],
    ['bottom right', 499, 399, { x: 100, y: 100 }, { width: 420, height: 330 }],
  ])('preserves %s resize geometry', (edge, x, y, offset, size) => {
    mouse(target, 'mousemove', x, y);
    mouse(target, 'mousedown', x, y);
    mouse(window, 'mousemove', x + 20, y + 30);
    mouse(window, 'mouseup', x + 20, y + 30);
    expect(geometry()).toEqual({ offset, size });
    expect(covers()).toHaveLength(0);
  });

  it.each([
    ['top left', 101, 101, 800, 600, { x: 300, y: 200 }],
    ['bottom right', 499, 399, 0, 0, { x: 100, y: 100 }],
  ])(
    'preserves the minimum size from the %s corner',
    (edge, x, y, endX, endY, offset) => {
      mouse(target, 'mousemove', x, y);
      mouse(target, 'mousedown', x, y);
      mouse(window, 'mousemove', endX, endY);
      mouse(window, 'mouseup', endX, endY);
      expect(geometry()).toEqual({ offset, size: { width: 200, height: 200 } });
    },
  );

  it('keeps the drag pointer inside the configured desktop boundaries', () => {
    mouse(header, 'mousedown', 200, 112);
    mouse(window, 'mousemove', -50, -50);
    expect(geometry().offset).toEqual({ x: -99, y: -11 });
    mouse(window, 'mousemove', 2000, 2000);
    expect(geometry().offset).toEqual({ x: 899, y: 687 });
    mouse(window, 'mouseup', 2000, 2000);
    expect(covers()).toHaveLength(0);
  });

  it.each(['pagehide', 'pointercancel', 'contextmenu'])(
    'cleans up an interrupted gesture on %s',
    eventType => {
      startResize();
      const stopped = geometry();
      act(() => {
        window.dispatchEvent(new Event(eventType));
      });
      expect(covers()).toHaveLength(0);
      mouse(window, 'mousemove', 600, 500);
      expect(geometry()).toEqual(stopped);
    },
  );

  it('cancels a gesture with Escape', () => {
    startDrag();
    const stopped = geometry();
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(covers()).toHaveLength(0);
    mouse(window, 'mousemove', 600, 500);
    expect(geometry()).toEqual(stopped);
  });

  it('cancels a stale gesture on a new press before starting another', () => {
    startDrag();
    mouse(covers()[0], 'mousedown', 250, 150);
    expect(covers()).toHaveLength(0);
    mouse(header, 'mousedown', 250, 150);
    mouse(window, 'mousemove', 260, 160);
    expect(geometry().offset).toEqual({ x: 140, y: 140 });
    mouse(window, 'mouseup', 260, 160);
    expect(covers()).toHaveLength(0);
  });

  it('cleans up when desktop boundaries or resize options change', () => {
    startResize();
    const stopped = geometry();
    render({ resizable: false, bounds: { ...boundary, right: 899 } });
    expect(covers()).toHaveLength(0);
    mouse(window, 'mousemove', 600, 500);
    expect(geometry()).toEqual(stopped);
    mouse(target, 'mousedown', 499, 250);
    expect(covers()).toHaveLength(0);
    mouse(header, 'mousedown', 200, 112);
    mouse(window, 'mousemove', 210, 122);
    mouse(window, 'mouseup', 210, 122);
    expect(geometry().offset).toEqual({ x: 110, y: 110 });
  });
});
