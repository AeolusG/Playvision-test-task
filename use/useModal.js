export function useModal(config = {}) {
  let shown = ref(config.shown);
  let typeOfClosing = ref(config.typeOfClosing);
  let title = ref(config.title);
  let timeLeft = ref(config.timeLeft);
  let windowWidth = ref(config.windowWidth);

  const changeVisibility = () => {
    shown.value = !shown.value;
  };

  return {
    shown,
    changeVisibility,
    typeOfClosing,
    title,
    timeLeft,
    windowWidth,
  };
}
