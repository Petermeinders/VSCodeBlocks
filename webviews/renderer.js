const hasPositionChanged = ({ pos, prevPos }) => pos !== prevPos;

const valueInRange = ({ minScale, maxScale, scale }) => scale <= maxScale && scale >= minScale;

const getTranslate = ({ minScale, maxScale, scale }) => ({ pos, prevPos, translate }) =>
    valueInRange({ minScale, maxScale, scale }) && hasPositionChanged({ pos, prevPos })
        ? translate + (pos - prevPos * scale) * (1 - 1 / scale)
        : translate;

const getMatrix = ({ scale, translateX, translateY }) => `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`;

const getScale = ({ scale, minScale, maxScale, scaleSensitivity, deltaScale }) => {
    let newScale = scale + (deltaScale / (scaleSensitivity / scale));
    newScale = Math.max(minScale, Math.min(newScale, maxScale));
    return [scale, newScale];
};

const pan = ({ state, originX, originY }) => {
    state.elements.forEach(el => {
        if (el.element && el.transformationType === 'translate3d') {

                    let {x, y, z} = getMatrixFrom3D(el.element);
                    // if (x === 0 && y === 0) {
                    //   x = +el.element.style.left.replace("px","");
                    //   y =  +el.element.style.top.replace("px","");
                    // }

                    x += originX;
                    y += originY;
                    z = 1;
       
                    el.element.style.transform = `matrix(${z}, 0, 0, ${z}, ${x}, ${y})`;
                
            }
        });

    state.transformation.translateX += originX;
    state.transformation.translateY += originY;

    state.elements.forEach(el => {
        if (el.element && el.transformationType === 'matrix'){
           el.element.style.transform = getMatrix({ scale: state.transformation.scale, translateX: state.transformation.translateX, translateY: state.transformation.translateY });
        }
    });

//   state.elements.forEach(el => {
//     if (el.element && el.transformationType === 'topandleft'){
//       let {x, y, z} = getMatrixFrom3D(el.element);
//       x += originX;
//       y += originY;
//       z = 1;
// if (x !== 0 || y !== 0) {
//       el.element.style.transform = `matrix(${z}, 0, 0, ${z}, ${x}, ${y})`;
//     }
//   }
// });
};

const canPan = (state) => ({
    panBy: ({ originX, originY }) => pan({ state, originX, originY }),
    panTo: ({ originX, originY, scale }) => {
        state.transformation.scale = scale;
        pan({ state, originX: originX - state.transformation.translateX, originY: originY - state.transformation.translateY });
    },
});

const canZoom = (state) => ({
    zoom: ({ pageX, pageY, deltaScale }) => {
      // let left1 = state.elements[0].element.getBoundingClientRect().left;
      // let top1 = state.elements[0].element.getBoundingClientRect().top;
       const { minScale, maxScale, scaleSensitivity } = state;
       const [scale, newScale] = getScale({ scale: state.transformation.scale, deltaScale, minScale, maxScale, scaleSensitivity });
      // let originX1 = pageX - left1;
      // let originY1 = pageY - top1;
      // let newOriginX1 = originX1 / scale;
      // let newOriginY1 = originY1 / scale;



      let left;
      let top;

      let originX;
      let  originY;
      let newOriginX;
      let newOriginY;

      ///Translate3d
      // state.elements.forEach((elem) => {
      //   if (elem.element && elem.transformationType === "translate3d") {
      //     left = elem.element.getBoundingClientRect().left;
      //     top = elem.element.getBoundingClientRect().top;

      //   let { x, y, z } = getMatrixFrom3D(elem.element);

      //     originX = left;
      //     originY = top;
      //     newOriginX = left / scale;
      //     newOriginY = top / scale;

      //     //Not needed?
      //     //elem.element.style.transformOrigin = `${x}px ${y}px`;


      //     const translate = getTranslate({ scale, minScale, maxScale });
      //     const translateX = translate({ pos: originX, prevPos: state.transformation.originX, translate: state.transformation.translateX });
      //     const translateY = translate({ pos: originY, prevPos: state.transformation.originY, translate: state.transformation.translateY });
      //     z = state.transformation.scale;
      //     elem.element.style.transform = `matrix(${newScale}, 0, 0, ${newScale}, ${translateX}, ${translateY})`;
      //     //state.transformation = { originX: newOriginX, originY: newOriginY, translateX, translateY, scale: newScale };
      //   }

      // });

      // const translate1 = getTranslate({ scale, minScale, maxScale });
      // const translateX1 = translate1({ pos: originX1, prevPos: state.transformation.originX, translate: state.transformation.translateX });
      // const translateY1 = translate1({ pos: originY1, prevPos: state.transformation.originY, translate: state.transformation.translateY });

      //Matrix
      state.elements.forEach((elem) => {
        if (elem.element && elem.transformationType === "matrix") {
          left = elem.element.getBoundingClientRect().left;
          top = elem.element.getBoundingClientRect().top;

          originX = pageX - left;
          originY = pageY - top;
          newOriginX = originX / scale;
          newOriginY = originY / scale;

          elem.element.style.transformOrigin = `${newOriginX}px ${newOriginY}px`;
          console.log()
          const translate = getTranslate({ scale, minScale, maxScale });
          const translateX = translate({ pos: originX, prevPos: state.transformation.originX, translate: state.transformation.translateX });
          const translateY = translate({ pos: originY, prevPos: state.transformation.originY, translate: state.transformation.translateY });


        elem.element.style.transform = getMatrix({ scale: newScale, translateX, translateY });

        state.transformation = { originX: newOriginX, originY: newOriginY, translateX, translateY, scale: newScale };
          
        }
      });

      //state.transformation = { originX: newOriginX1, originY: newOriginY1, translateX1, translateY1, scale: newScale };

    }
});

const renderer = ({ minScale, maxScale, elements, scaleSensitivity = 10, zoomElement }) => {
    const state = {
        elements,
        minScale,
        maxScale,
        scaleSensitivity,
        transformation: {
            originX: 0,
            originY: 0,
            translateX: 0,
            translateY: 0,
            scale: 1
        }
    };
    return Object.assign({}, canZoom(state, zoomElement), canPan(state));
};

function getMatrixFrom3D(element) {
        const style = window.getComputedStyle(element)
        const matrix = style['transform'] || style.webkitTransform || style.mozTransform
      
        // No transform property. Simply return 0 values.
        if (matrix === 'none' || typeof matrix === 'undefined') {
          return {
            x: 0,
            y: 0,
            z: 0
          }
        }
      
        // Can either be 2d or 3d transform
        const matrixType = matrix.includes('3d') ? '3d' : '2d'
        const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ')
      
        // 2d matrices have 6 values
        // Last 2 values are X and Y.
        // 2d matrices does not have Z value.
        if (matrixType === '2d') {
          return {
            x: +matrixValues[4],
            y: +matrixValues[5],
            z: 0
          }
        }
      
        // 3d matrices have 16 values
        // The 13th, 14th, and 15th values are X, Y, and Z
        if (matrixType === '3d') {
          return {
            x: +matrixValues[12],
            y: +matrixValues[13],
            z: +matrixValues[14]
          }
        }
      }

module.exports = { renderer };