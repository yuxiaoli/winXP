import React, { useLayoutEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import useElementResize from './useElementResize';

const defaultOffset = { x: 100, y: 100 };
const defaultSize = { width: 400, height: 300 };
const boundary = { top: 1, right: 999, bottom: 699, left: 1 };

function WindowFixture({
  resizable = true,
  bounds = boundary,
  fitToViewport = false,
  visible = true,
  initialOffset = defaultOffset,
  initialSize = defaultSize,
  measuredSize,
}) {
  const ref = useRef(null);
  const dragRef = useRef(null);
  useLayoutEffect(() => {
    if (measuredSize) {
      ref.current.getBoundingClientRect = () => ({ ...measuredSize });
    }
  }, [measuredSize]);
  const { offset, size } = useElementResize(ref, {
    dragRef,
    defaultOffset: initialOffset,
    defaultSize: initialSize,
    boundary: bounds,
    resizable,
    fitToViewport,
    visible,
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
    if (!props.measuredSize) {
      target.getBoundingClientRect = () => ({
        left: 100,
        top: 100,
        width: 400,
        height: 300,
        right: 500,
        bottom: 400,
      });
    }
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

  describe('optional viewport fitting', () => {
    const wide = { top: 1, left: 1, right: 1199, bottom: 799 };
    const narrow = { top: 1, left: 1, right: 601, bottom: 469 };
    const initialOffset = { x: 250, y: 40 };
    const initialSize = { width: 660, height: 500 };
    const fitProps = { fitToViewport: true, initialOffset, initialSize };

    function mount(props) {
      act(() => {
        ReactDOM.unmountComponentAtNode(container);
      });
      render(props);
    }

    it('fits existing normal geometry after a narrow viewport change', () => {
      mount({ ...fitProps, bounds: wide });
      expect(geometry()).toEqual({ offset: initialOffset, size: initialSize });
      render({ ...fitProps, bounds: narrow });
      expect(geometry()).toEqual({
        offset: { x: 1, y: 1 },
        size: { width: 600, height: 468 },
      });
      expect(covers()).toHaveLength(0);
    });

    it('fits a new window immediately and stays stable through shrink/grow cycles', () => {
      mount({ ...fitProps, bounds: narrow });
      const fitted = geometry();
      expect(fitted).toEqual({
        offset: { x: 1, y: 1 },
        size: { width: 600, height: 468 },
      });
      render({ ...fitProps, bounds: wide });
      expect(geometry()).toEqual(fitted);
      render({ ...fitProps, bounds: narrow });
      expect(geometry()).toEqual(fitted);
    });

    it('starts the next drag from fitted geometry without normalizing every movement', () => {
      mount({ ...fitProps, bounds: wide });
      render({ ...fitProps, bounds: narrow });
      mouse(header, 'mousedown', 100, 12);
      mouse(window, 'mousemove', 120, 32);
      mouse(window, 'mouseup', 120, 32);
      expect(geometry()).toEqual({
        offset: { x: 21, y: 21 },
        size: { width: 600, height: 468 },
      });
      render({ ...fitProps, bounds: { ...narrow } });
      expect(geometry().offset).toEqual({ x: 21, y: 21 });
    });

    it('cancels an active gesture and fits the latest geometry on viewport change', () => {
      mount({ ...fitProps, bounds: wide });
      mouse(header, 'mousedown', 300, 50);
      mouse(window, 'mousemove', 330, 80);
      expect(covers()).toHaveLength(1);
      render({ ...fitProps, bounds: narrow });
      const fitted = geometry();
      expect(fitted.offset).toEqual({ x: 1, y: 1 });
      expect(covers()).toHaveLength(0);
      mouse(window, 'mousemove', 400, 100);
      expect(geometry()).toEqual(fitted);
    });

    it('fits stored restore geometry independently of maximized or hidden DOM sizing', () => {
      mount({ ...fitProps, bounds: wide });
      render({
        ...fitProps,
        bounds: narrow,
        measuredSize: { width: 608, height: 476 },
      });
      const fitted = geometry();
      expect(fitted.size).toEqual({ width: 600, height: 468 });
      expect(fitted.offset).toEqual({ x: 1, y: 1 });
      render({
        ...fitProps,
        bounds: { ...narrow, right: 501 },
        measuredSize: { width: 0, height: 0 },
      });
      expect(geometry()).toEqual({
        offset: { x: 1, y: 1 },
        size: { width: 500, height: 468 },
      });
    });

    it('repositions intrinsic windows without assigning fixed dimensions', () => {
      const props = {
        fitToViewport: true,
        resizable: false,
        initialOffset: { x: 700, y: 500 },
        initialSize: { width: 0, height: 0 },
        measuredSize: { width: 280, height: 320 },
      };
      mount({ ...props, bounds: wide });
      render({ ...props, bounds: narrow });
      expect(geometry()).toEqual({
        offset: { x: 321, y: 149 },
        size: { width: 0, height: 0 },
      });
    });

    it('retains the last measured intrinsic dimensions while a window is hidden', () => {
      const props = {
        fitToViewport: true,
        resizable: false,
        initialOffset: { x: 700, y: 500 },
        initialSize: { width: 0, height: 0 },
      };
      mount({
        ...props,
        bounds: wide,
        measuredSize: { width: 280, height: 320 },
      });
      render({
        ...props,
        bounds: narrow,
        visible: false,
        measuredSize: { width: 0, height: 0 },
      });
      expect(geometry().offset).toEqual({ x: 321, y: 149 });
      expect(geometry().size).toEqual({ width: 0, height: 0 });
    });

    it('remeasures intrinsic windows on restore even when the boundaries have not changed', () => {
      const props = {
        fitToViewport: true,
        resizable: false,
        initialOffset: { x: 700, y: 500 },
        initialSize: { width: 0, height: 0 },
        bounds: narrow,
      };
      mount({
        ...props,
        visible: false,
        measuredSize: { width: 0, height: 0 },
      });
      render({
        ...props,
        visible: true,
        measuredSize: { width: 280, height: 320 },
      });
      expect(geometry()).toEqual({
        offset: { x: 321, y: 149 },
        size: { width: 0, height: 0 },
      });
    });

    it('keeps resize minimums within very small viewports after fitting', () => {
      mount({
        ...fitProps,
        bounds: { top: 1, left: 1, right: 149, bottom: 149 },
        measuredSize: { top: 1, left: 1, width: 148, height: 148 },
      });
      expect(geometry().size).toEqual({ width: 148, height: 148 });
      mouse(target, 'mousedown', 148, 148);
      mouse(window, 'mousemove', 100, 100);
      mouse(window, 'mouseup', 100, 100);
      expect(geometry().size).toEqual({ width: 148, height: 148 });
    });

    it('keeps right-side controls and the titlebar reachable for oversized fixed windows', () => {
      mount({ ...fitProps, resizable: false, bounds: narrow });
      expect(geometry()).toEqual({
        offset: { x: -59, y: 1 },
        size: initialSize,
      });
    });

    it('leaves opt-out windows unchanged when the viewport shrinks', () => {
      mount({ initialOffset, initialSize, bounds: wide });
      render({ initialOffset, initialSize, bounds: narrow });
      expect(geometry()).toEqual({ offset: initialOffset, size: initialSize });
    });

    it('ignores temporarily invalid viewport measurements', () => {
      mount({ ...fitProps, bounds: wide });
      render({
        ...fitProps,
        bounds: { top: 1, left: 1, right: -1, bottom: -31 },
      });
      expect(geometry()).toEqual({ offset: initialOffset, size: initialSize });
    });
  });
});
