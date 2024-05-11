function calculateAverage(arrayOfNumbers: number[]): number {
  const size = arrayOfNumbers.filter(
    item => item !== 0 && typeof item === 'number',
  ).length;

  if (size === 0) {
    // Handle empty array case: return 0
    return 0;
  }

  let sum = 0;

  for (let i = 0; i < size; i++) {
    if (typeof arrayOfNumbers[i] === 'number') {
      sum += arrayOfNumbers[i];
    }
  }

  // Check for non-numeric elements before rounding
  if (isNaN(sum)) {
    // Handle non-numeric array elements: return 0
    return 0;
  }

  const average = sum / size;
  const roundedAverage = Number(average.toFixed(2));

  return roundedAverage;
}

function calculateMinExcludingZero(resultArray: number[]) {
  const nonZeroArray = resultArray.filter(
    value => value !== 0 && typeof value === 'number',
  );

  if (nonZeroArray.length === 0) return 0;

  return Math.min(...nonZeroArray);
}

function calculateMaxExcludingZero(resultArray: number[]) {
  const nonZeroArray = resultArray.filter(
    value => value !== 0 && typeof value === 'number',
  );

  if (nonZeroArray.length === 0) return 0;

  return Math.max(...nonZeroArray);
}

type CallbackFunction = (event: any) => void;

// Function to debounce the event listener
function debounce(callback: CallbackFunction, delay: number): CallbackFunction {
  let timerId: NodeJS.Timeout;

  return function (...args: any[]) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      // @ts-ignore
      callback.apply(this, args);
    }, delay);
  };
}

export {
  calculateAverage,
  debounce,
  calculateMaxExcludingZero,
  calculateMinExcludingZero,
};
