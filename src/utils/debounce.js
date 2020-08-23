export function debounce(func, wait) {
  // timeout closure
  let timeout;

  return (...args) => {
    // delayed function to call
    let later = () => {
      // reset timeout var
      timeout = null;
      // call func
      func(...args);
    };

    // clear previous timeout
    clearTimeout(timeout);
    // set new one
    timeout = setTimeout(later, wait);
  };
}
