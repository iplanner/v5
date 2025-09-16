
/**
 * Berechnet die Position eines Elements relativ zu einem Ziel-Element
 * 
 * @param {Object} target - Ziel-Element mit Eigenschaften: top, left, width, height
 * @param {string} position - Position relativ zum Ziel: 'top', 'right', 'bottom', 'left'
 * @param {string} align - Ausrichtung:
 *   - Für position 'top'/'bottom': 'left', 'center', 'right'
 *   - Für position 'left'/'right': 'top', 'center', 'bottom'
 * @param {number} edge - Abstand zum Ziel-Element
 * @param {Array<number>} offset - Zusätzlicher Offset [x, y]
 * @returns {Object} Style-Objekt mit top, left und transform Eigenschaften
 */
export function calcPositionByTarget(target, position, align, edge, offset) {
  // Input-Validierung
  if (!target || typeof target !== 'object') {
    throw new Error('Target muss ein Objekt mit top, left, width, height Eigenschaften sein');
  }

  const requiredProps = ['top', 'left', 'width', 'height'];
  for (const prop of requiredProps) {
    if (typeof target[prop] !== 'number') {
      throw new Error(`Target.${prop} muss eine Zahl sein`);
    }
  }

  if (!Array.isArray(offset) || offset.length !== 2) {
    throw new Error('Offset muss ein Array mit 2 Zahlen sein [x, y]');
  }

  const validPositions = ['top', 'right', 'bottom', 'left'];
  if (!validPositions.includes(position)) {
    throw new Error(`Position muss einer von ${validPositions.join(', ')} sein`);
  }

  // Default Style
  let style = {
    top: '0px',
    left: '0px',
    transform: 'translate(0%, 0%)'
  };

  const [offsetX, offsetY] = offset;

  switch (position) {
    case 'top':
      // Gültige Align-Werte: left, center, right
      switch (align) {
        case 'left':
          style = {
            top: `${target.top - edge - offsetY}px`,
            left: `${target.left + offsetX}px`,
            transform: 'translate(0%, -100%)'
          };
          break;

        case 'center':
          style = {
            top: `${target.top - edge - offsetY}px`,
            left: `${target.left + target.width / 2 + offsetX}px`,
            transform: 'translate(-50%, -100%)'
          };
          break;

        case 'right':
          style = {
            top: `${target.top - edge - offsetY}px`,
            left: `${target.left + target.width + offsetX}px`,
            transform: 'translate(-100%, -100%)'
          };
          break;

        default:
          throw new Error('Für position "top" muss align "left", "center" oder "right" sein');
      }
      break;

    case 'right':
      // Gültige Align-Werte: top, center, bottom
      switch (align) {
        case 'top':
          style = {
            top: `${target.top + offsetY}px`,
            left: `${target.left + target.width + edge + offsetX}px`,
            transform: 'translate(0%, 0%)'
          };
          break;

        case 'center':
          style = {
            top: `${target.top + target.height / 2 + offsetY}px`,
            left: `${target.left + target.width + edge + offsetX}px`,
            transform: 'translate(0%, -50%)'
          };
          break;

        case 'bottom':
          style = {
            top: `${target.top + target.height + offsetY}px`,
            left: `${target.left + target.width + edge + offsetX}px`,
            transform: 'translate(0%, -100%)'
          };
          break;

        default:
          throw new Error('Für position "right" muss align "top", "center" oder "bottom" sein');
      }
      break;

    case 'bottom':
      // Gültige Align-Werte: left, center, right
      switch (align) {
        case 'left':
          style = {
            top: `${target.top + target.height + edge + offsetY}px`,
            left: `${target.left + offsetX}px`,
            transform: 'translate(0%, 0%)'
          };
          break;

        case 'center':
          style = {
            top: `${target.top + target.height + edge + offsetY}px`,
            left: `${target.left + target.width / 2 + offsetX}px`,
            transform: 'translate(-50%, 0%)'
          };
          break;

        case 'right':
          style = {
            top: `${target.top + target.height + edge + offsetY}px`,
            left: `${target.left + target.width + offsetX}px`,
            transform: 'translate(-100%, 0%)'
          };
          break;

        default:
          throw new Error('Für position "bottom" muss align "left", "center" oder "right" sein');
      }
      break;

    case 'left':
      // Gültige Align-Werte: top, center, bottom
      switch (align) {
        case 'top':
          style = {
            top: `${target.top + offsetY}px`,
            left: `${target.left - edge - offsetX}px`,
            transform: 'translate(-100%, 0%)'
          };
          break;

        case 'center':
          style = {
            top: `${target.top + target.height / 2 + offsetY}px`,
            left: `${target.left - edge - offsetX}px`,
            transform: 'translate(-100%, -50%)'
          };
          break;

        case 'bottom':
          style = {
            top: `${target.top + target.height + offsetY}px`,
            left: `${target.left - edge - offsetX}px`,
            transform: 'translate(-100%, -100%)'
          };
          break;

        default:
          throw new Error('Für position "left" muss align "top", "center" oder "bottom" sein');
      }
      break;
  }

  return style;
}

// Beispiel für die Verwendung:
/*
const target = {
  top: 100,
  left: 200,
  width: 150,
  height: 50
};

const style = calcPositionByTarget(
  target,
  'bottom',      // Position unter dem Element
  'center',      // Zentriert ausgerichtet
  10,            // 10px Abstand
  [5, -2]        // 5px nach rechts, 2px nach oben verschoben
);

console.log(style);
// Ergebnis: { top: '158px', left: '280px', transform: 'translate(-50%, 0%)' }
*/