import { useEffect, useRef, useState } from 'react';

function useElementResize(ref, options) {
  const {
    defaultOffset,
    defaultSize,
    boundary,
    dragRef,
    resizable = true,
    resizeThreshold = 10,
    constraintSize = 200,
    fitToViewport = false,
    visible = true,
  } = options;
  const [offset, setOffset] = useState(defaultOffset);
  const [size, setSize] = useState(defaultSize);
  const geometry = useRef({ offset, size });
  const measuredSize = useRef({ width: 0, height: 0 });
  const { top, right, bottom, left } = boundary;

  useEffect(() => {
    const target = ref.current;
    if (!target) return;
    const dragTarget = dragRef && dragRef.current;
    const previousCursor = target.style.cursor;
    const cover = document.createElement('div');
    cover.style.position = 'fixed';
    cover.style.top = 0;
    cover.style.left = 0;
    cover.style.right = 0;
    cover.style.bottom = 0;
    cover.style.zIndex = 2147483647;
    let gesture = null;

    function finish() {
      gesture = null;
      cover.remove();
      target.style.cursor = previousCursor;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('mousedown', finish, true);
      window.removeEventListener('blur', finish);
      window.removeEventListener('pagehide', finish);
      window.removeEventListener('pointercancel', finish);
      window.removeEventListener('contextmenu', finish);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') finish();
    }

    function onVisibilityChange() {
      if (document.hidden) finish();
    }

    function applyGeometry({ offset: nextOffset, size: nextSize }) {
      const current = geometry.current;
      geometry.current = { offset: nextOffset, size: nextSize };
      if (
        nextOffset.x !== current.offset.x ||
        nextOffset.y !== current.offset.y
      ) {
        setOffset(nextOffset);
      }
      if (
        nextSize.width !== current.size.width ||
        nextSize.height !== current.size.height
      ) {
        setSize(nextSize);
      }
    }

    function updateGeometry(e) {
      const { pageX, pageY } = getComputedPagePosition(e, gesture.boundary);
      const dx = pageX - gesture.x;
      const dy = pageY - gesture.y;
      const nextOffset = { ...gesture.offset };
      const nextSize = { ...gesture.size };
      if (gesture.mode === 'drag') {
        nextOffset.x += dx;
        nextOffset.y += dy;
      } else {
        if (gesture.horizontal) nextSize.width += gesture.horizontal * dx;
        if (gesture.vertical) nextSize.height += gesture.vertical * dy;
        if (gesture.horizontal < 0) nextOffset.x += dx;
        if (gesture.vertical < 0) nextOffset.y += dy;
      }
      applyGeometry({ offset: nextOffset, size: nextSize });
    }

    function onMove(e) {
      // A release outside this document may never produce our mouseup event.
      // Do not move the window to the returning, unpressed pointer's position.
      if ((e.buttons & 1) === 0) return finish();
      if (!gesture) return;
      if (!cover.parentNode) document.body.appendChild(cover);
      updateGeometry(e);
    }

    function onEnd(e) {
      if (e.button !== 0 || !gesture) return;
      updateGeometry(e);
      finish();
    }

    function onMouseDown(e) {
      if (e.button !== 0) return;
      const mode =
        dragTarget && e.target === dragTarget
          ? 'drag'
          : resizable && e.target === target
          ? getResizePosition(e, target, resizeThreshold)
          : '';
      if (!mode) return;
      finish();
      const horizontal = /left/i.test(mode) ? -1 : /right/i.test(mode) ? 1 : 0;
      const vertical = /top/i.test(mode) ? -1 : /bottom/i.test(mode) ? 1 : 0;
      const limits = { top, right, bottom, left };
      const current = geometry.current;
      const minimumWidth =
        fitToViewport && right > left
          ? Math.min(constraintSize, right - left)
          : constraintSize;
      const minimumHeight =
        fitToViewport && bottom > top
          ? Math.min(constraintSize, bottom - top)
          : constraintSize;
      if (horizontal < 0) {
        limits.right = e.pageX + current.size.width - minimumWidth;
      } else if (horizontal > 0) {
        limits.left = e.pageX - current.size.width + minimumWidth;
      }
      if (vertical < 0) {
        limits.bottom = e.pageY + current.size.height - minimumHeight;
      } else if (vertical > 0) {
        limits.top = e.pageY - current.size.height + minimumHeight;
      }
      gesture = {
        mode,
        horizontal,
        vertical,
        boundary: limits,
        x: e.pageX,
        y: e.pageY,
        offset: { ...current.offset },
        size: { ...current.size },
      };
      cover.style.cursor = mode === 'drag' ? 'move' : getCursorStyle(mode);
      // Shield embedded apps while resizing. A title click only needs a shield
      // once it moves, so ordinary title clicks/double-clicks keep their targets.
      if (mode !== 'drag') document.body.appendChild(cover);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('mousedown', finish, true);
      window.addEventListener('blur', finish);
      window.addEventListener('pagehide', finish);
      window.addEventListener('pointercancel', finish);
      window.addEventListener('contextmenu', finish);
      window.addEventListener('keydown', onKeyDown);
      document.addEventListener('visibilitychange', onVisibilityChange);
    }

    function onHover(e) {
      if (gesture) return;
      const mode =
        resizable && e.target === target
          ? getResizePosition(e, target, resizeThreshold)
          : '';
      target.style.cursor = mode ? getCursorStyle(mode) : previousCursor;
    }

    function onHoverEnd() {
      if (!gesture) target.style.cursor = previousCursor;
    }

    // Run only when the desktop/options change, never on ordinary drag updates.
    // Explicit sizes describe the normal restore geometry even when the DOM is
    // maximized. Intrinsic windows keep their sizing and are measured on restore.
    if (fitToViewport) {
      if (visible) {
        const measured = target.getBoundingClientRect();
        if (measured.width > 0) measuredSize.current.width = measured.width;
        if (measured.height > 0) measuredSize.current.height = measured.height;
      }
      applyGeometry(
        getFittedGeometry(
          geometry.current,
          { top, right, bottom, left },
          resizable,
          measuredSize.current,
        ),
      );
    }

    target.addEventListener('mousedown', onMouseDown);
    target.addEventListener('mousemove', onHover);
    target.addEventListener('mouseleave', onHoverEnd);
    return () => {
      finish();
      target.removeEventListener('mousedown', onMouseDown);
      target.removeEventListener('mousemove', onHover);
      target.removeEventListener('mouseleave', onHoverEnd);
    };
  }, [
    ref,
    dragRef,
    top,
    right,
    bottom,
    left,
    resizable,
    resizeThreshold,
    constraintSize,
    fitToViewport,
    visible,
  ]);
  return { offset, size };
}

function getFittedGeometry(current, boundary, resizable, measuredSize) {
  const { top, right, bottom, left } = boundary;
  const availableWidth = right - left;
  const availableHeight = bottom - top;
  if (
    ![top, right, bottom, left].every(Number.isFinite) ||
    availableWidth <= 0 ||
    availableHeight <= 0
  ) {
    return current;
  }
  const size = { ...current.size };
  if (resizable) {
    if (size.width > 0) size.width = Math.min(size.width, availableWidth);
    if (size.height > 0) size.height = Math.min(size.height, availableHeight);
  }
  const width = size.width > 0 ? size.width : measuredSize.width;
  const height = size.height > 0 ? size.height : measuredSize.height;
  return {
    size,
    offset: {
      // Fixed/intrinsic windows may be wider than the screen. Keep their right
      // edge (and Close control) visible rather than forcing a fixed width.
      x: Math.min(Math.max(current.offset.x, left), right - width),
      // If the content is too tall, keep the titlebar above the taskbar.
      y: Math.max(top, Math.min(current.offset.y, bottom - height)),
    },
  };
}

function getResizePosition(e, target, threshold) {
  const { left, top, width, height } = target.getBoundingClientRect();
  const x = e.clientX - left;
  const y = e.clientY - top;
  const vertical =
    y < threshold ? 'top' : height - y < threshold ? 'bottom' : '';
  const horizontal =
    x < threshold ? 'left' : width - x < threshold ? 'right' : '';
  if (vertical && horizontal) {
    return vertical + horizontal[0].toUpperCase() + horizontal.slice(1);
  }
  return vertical || horizontal;
}

function getComputedPagePosition(e, boundary) {
  let { pageX, pageY } = e;
  const { top, right, bottom, left } = boundary;
  if (pageX <= left) pageX = left;
  else if (pageX >= right) pageX = right;
  if (pageY <= top) pageY = top;
  else if (pageY >= bottom) pageY = bottom;
  return { pageX, pageY };
}

function getCursorStyle(pos) {
  switch (pos) {
    case 'top':
      return 'n-resize';
    case 'topRight':
      return 'ne-resize';
    case 'right':
      return 'e-resize';
    case 'bottomRight':
      return 'se-resize';
    case 'bottom':
      return 's-resize';
    case 'bottomLeft':
      return 'sw-resize';
    case 'left':
      return 'w-resize';
    case 'topLeft':
      return 'nw-resize';
    default:
      return 'auto';
  }
}
export default useElementResize;
