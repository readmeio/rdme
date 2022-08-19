export default function hideFromHelpScreen() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (constructor: Function) {
    // eslint-disable-next-line no-param-reassign
    constructor.prototype.hidden = true;
  };
}
