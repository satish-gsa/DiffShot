import { useReducer, useCallback } from 'react';

const initialState = {
  tool: 'pointer', // pointer | draw | rect | circle | arrow | text
  color: '#ff0000',
  strokeWidth: 3,
  fontSize: 18,
  annotations: { before: [], after: [] },
  history: { before: [[]], after: [[]] },
  historyIndex: { before: 0, after: 0 },
  isDrawing: false,
  selectedId: null,
  activeImage: 'before', // which image is being annotated
};

function pushHistory(history, index, which, newAnnotations) {
  const past = history[which].slice(0, index[which] + 1);
  past.push(newAnnotations);
  return {
    history: { ...history, [which]: past },
    historyIndex: { ...index, [which]: past.length - 1 },
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TOOL':
      return { ...state, tool: action.tool, selectedId: action.tool === 'pointer' ? state.selectedId : null };
    case 'SET_COLOR':
      return { ...state, color: action.color };
    case 'SET_STROKE_WIDTH':
      return { ...state, strokeWidth: action.width };
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.size };
    case 'SET_ACTIVE_IMAGE':
      return { ...state, activeImage: action.which, selectedId: null };
    case 'SET_SELECTED':
      return { ...state, selectedId: action.id };
    case 'SET_DRAWING':
      return { ...state, isDrawing: action.isDrawing };

    case 'ADD_ANNOTATION': {
      const { which, annotation } = action;
      const newAnns = [...state.annotations[which], annotation];
      const { history, historyIndex } = pushHistory(
        state.history,
        state.historyIndex,
        which,
        newAnns,
      );
      return {
        ...state,
        annotations: { ...state.annotations, [which]: newAnns },
        history,
        historyIndex,
      };
    }

    case 'UPDATE_ANNOTATION': {
      const { which, id, updates } = action;
      const newAnns = state.annotations[which].map((a) =>
        a.id === id ? { ...a, ...updates } : a,
      );
      const { history, historyIndex } = pushHistory(
        state.history,
        state.historyIndex,
        which,
        newAnns,
      );
      return {
        ...state,
        annotations: { ...state.annotations, [which]: newAnns },
        history,
        historyIndex,
      };
    }

    case 'UPDATE_DRAWING_POINTS': {
      const { which, id, points } = action;
      const newAnns = state.annotations[which].map((a) =>
        a.id === id ? { ...a, points } : a,
      );
      return {
        ...state,
        annotations: { ...state.annotations, [which]: newAnns },
      };
    }

    case 'COMMIT_DRAWING': {
      const { which } = action;
      const { history, historyIndex } = pushHistory(
        state.history,
        state.historyIndex,
        which,
        state.annotations[which],
      );
      return { ...state, history, historyIndex };
    }

    case 'DELETE_ANNOTATION': {
      const { which, id } = action;
      const newAnns = state.annotations[which].filter((a) => a.id !== id);
      const { history, historyIndex } = pushHistory(
        state.history,
        state.historyIndex,
        which,
        newAnns,
      );
      return {
        ...state,
        annotations: { ...state.annotations, [which]: newAnns },
        history,
        historyIndex,
        selectedId: state.selectedId === id ? null : state.selectedId,
      };
    }

    case 'UNDO': {
      const { which } = action;
      const idx = state.historyIndex[which];
      if (idx <= 0) return state;
      const newIdx = idx - 1;
      return {
        ...state,
        annotations: {
          ...state.annotations,
          [which]: state.history[which][newIdx],
        },
        historyIndex: { ...state.historyIndex, [which]: newIdx },
        selectedId: null,
      };
    }

    case 'REDO': {
      const { which } = action;
      const idx = state.historyIndex[which];
      if (idx >= state.history[which].length - 1) return state;
      const newIdx = idx + 1;
      return {
        ...state,
        annotations: {
          ...state.annotations,
          [which]: state.history[which][newIdx],
        },
        historyIndex: { ...state.historyIndex, [which]: newIdx },
        selectedId: null,
      };
    }

    case 'CLEAR_ANNOTATIONS': {
      const { which } = action;
      const { history, historyIndex } = pushHistory(
        state.history,
        state.historyIndex,
        which,
        [],
      );
      return {
        ...state,
        annotations: { ...state.annotations, [which]: [] },
        history,
        historyIndex,
        selectedId: null,
      };
    }

    default:
      return state;
  }
}

let idCounter = 0;
export function genId() {
  return `ann_${++idCounter}_${Date.now()}`;
}

export default function useAnnotations() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setTool = useCallback((tool) => dispatch({ type: 'SET_TOOL', tool }), []);
  const setColor = useCallback((color) => dispatch({ type: 'SET_COLOR', color }), []);
  const setStrokeWidth = useCallback((width) => dispatch({ type: 'SET_STROKE_WIDTH', width }), []);
  const setFontSize = useCallback((size) => dispatch({ type: 'SET_FONT_SIZE', size }), []);
  const setActiveImage = useCallback((which) => dispatch({ type: 'SET_ACTIVE_IMAGE', which }), []);
  const setSelected = useCallback((id) => dispatch({ type: 'SET_SELECTED', id }), []);
  const setDrawing = useCallback((isDrawing) => dispatch({ type: 'SET_DRAWING', isDrawing }), []);

  const addAnnotation = useCallback((which, annotation) => {
    dispatch({ type: 'ADD_ANNOTATION', which, annotation });
  }, []);

  const updateAnnotation = useCallback((which, id, updates) => {
    dispatch({ type: 'UPDATE_ANNOTATION', which, id, updates });
  }, []);

  const updateDrawingPoints = useCallback((which, id, points) => {
    dispatch({ type: 'UPDATE_DRAWING_POINTS', which, id, points });
  }, []);

  const commitDrawing = useCallback((which) => {
    dispatch({ type: 'COMMIT_DRAWING', which });
  }, []);

  const deleteAnnotation = useCallback((which, id) => {
    dispatch({ type: 'DELETE_ANNOTATION', which, id });
  }, []);

  const undo = useCallback((which) => dispatch({ type: 'UNDO', which }), []);
  const redo = useCallback((which) => dispatch({ type: 'REDO', which }), []);
  const clearAnnotations = useCallback((which) => dispatch({ type: 'CLEAR_ANNOTATIONS', which }), []);

  return {
    ann: state,
    setTool,
    setColor,
    setStrokeWidth,
    setFontSize,
    setActiveImage,
    setSelected,
    setDrawing,
    addAnnotation,
    updateAnnotation,
    updateDrawingPoints,
    commitDrawing,
    deleteAnnotation,
    undo,
    redo,
    clearAnnotations,
  };
}
