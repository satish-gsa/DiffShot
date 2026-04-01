import {
  ReactCompareSlider,
  ReactCompareSliderImage,
  ReactCompareSliderHandle,
} from 'react-compare-slider';

export default function SliderView({ before, after, containerRef, showLabels = true }) {
  return (
    <div className="slider-view" ref={containerRef}>
      <ReactCompareSlider
        handle={
          <ReactCompareSliderHandle
            buttonStyle={{
              width: 36,
              height: 36,
              borderRadius: 18,
              border: '2px solid #fff',
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
            linesStyle={{ width: 2, color: '#fff' }}
          />
        }
        itemOne={
          <ReactCompareSliderImage
            src={before}
            alt="Before"
            style={{ objectFit: 'contain', width: '100%' }}
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={after}
            alt="After"
            style={{ objectFit: 'contain', width: '100%' }}
          />
        }
        style={{ width: '100%', height: '100%' }}
      />
      {showLabels && <span className="slider-label left">BEFORE</span>}
      {showLabels && <span className="slider-label right">AFTER</span>}
    </div>
  );
}
