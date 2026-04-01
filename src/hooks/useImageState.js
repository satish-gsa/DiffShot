import { useReducer, useCallback } from 'react';

const initialState = {
  before: { original: null, cropped: null, zoom: 1 },
  after: { original: null, cropped: null, zoom: 1 },
  cropTarget: null, // 'before' | 'after' | null
  aspectRatio: null, // null = free, or number like 1, 16/9
  aspectLabel: 'Free',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_IMAGE': {
      const { which, url } = action;
      return {
        ...state,
        [which]: { ...state[which], original: url, cropped: url },
      };
    }
    case 'SET_CROPPED': {
      const { which, url } = action;
      return {
        ...state,
        [which]: { ...state[which], cropped: url },
      };
    }
    case 'SET_ZOOM': {
      const { which, zoom } = action;
      return {
        ...state,
        [which]: { ...state[which], zoom },
      };
    }
    case 'SET_CROP_TARGET':
      return { ...state, cropTarget: action.target };
    case 'SET_ASPECT': {
      return {
        ...state,
        aspectRatio: action.ratio,
        aspectLabel: action.label,
      };
    }
    case 'CLEAR_IMAGE': {
      const { which } = action;
      return {
        ...state,
        [which]: { original: null, cropped: null, zoom: 1 },
      };
    }
    case 'SWAP_IMAGES':
      return {
        ...state,
        before: { ...state.after },
        after: { ...state.before },
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

export default function useImageState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setImage = useCallback(async (which, file) => {
    const url = await fileToDataUrl(file);
    dispatch({ type: 'SET_IMAGE', which, url });
  }, []);

  const setImageUrl = useCallback((which, url) => {
    dispatch({ type: 'SET_IMAGE', which, url });
  }, []);

  const setCropped = useCallback((which, url) => {
    dispatch({ type: 'SET_CROPPED', which, url });
  }, []);

  const setZoom = useCallback((which, zoom) => {
    dispatch({ type: 'SET_ZOOM', which, zoom });
  }, []);

  const openCrop = useCallback((target) => {
    dispatch({ type: 'SET_CROP_TARGET', target });
  }, []);

  const closeCrop = useCallback(() => {
    dispatch({ type: 'SET_CROP_TARGET', target: null });
  }, []);

  const setAspect = useCallback((ratio, label) => {
    dispatch({ type: 'SET_ASPECT', ratio, label });
  }, []);

  const clearImage = useCallback((which) => {
    dispatch({ type: 'CLEAR_IMAGE', which });
  }, []);

  const swapImages = useCallback(() => {
    dispatch({ type: 'SWAP_IMAGES' });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    images: state,
    setImage,
    setImageUrl,
    setCropped,
    setZoom,
    openCrop,
    closeCrop,
    setAspect,
    clearImage,
    swapImages,
    resetAll,
  };
}
