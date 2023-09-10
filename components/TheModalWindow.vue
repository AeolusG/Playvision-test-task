<template>
  <div class="modal-window">
    <div class="modal-window__content" :style="{ width: windowWidth + 'px' }">
      <header class="modal-window__title">
        <h2>{{ title }}</h2>

        <div v-if="isTimer" class="modal-window__timer">
          {{ countdown }}
        </div>
        <div v-if="isClose" class="modal-window__close">
          <TheCloseButton @click="closeModalWindow" />
        </div>
      </header>

      <div class="modal-window__wrapper">
        <slot name="content"></slot>
      </div>
      <div class="modal-window__footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import typeOfClosing from '../enums/typeOfClosing';
import TheCloseButton from './TheCloseButton.vue';

export default {
  components: {
    TheCloseButton,
  },
  props: {
    timeLeft: {
      type: Number,
      default: 10,
    },
    typeOfClosing: {
      type: String,
      default: null,
    },
    title: {
      type: String,
    },
    windowWidth: {
      type: Number,
      default: 250,
    },
  },
  emits: ['closeModalWindow'],
  setup(props, { emit }) {
    onMounted(() => {
      if (props.typeOfClosing !== typeOfClosing.TIMER) {
        return;
      }

      setTimeout(() => {
        clearInterval(timerId);
        closeModalWindow();
      }, countdown.value * 1000);
    });

    let isTimer = ref(props.typeOfClosing === typeOfClosing.TIMER);
    let isClose = ref(props.typeOfClosing === typeOfClosing.CLOSE);

    let isShown = ref(false);

    let countdown = ref(props.timeLeft);
    let timerId = setInterval(() => countdown.value--, 1000);

    function closeModalWindow() {
      emit('closeModalWindow', isShown);
    }

    return {
      countdown,
      isTimer,
      isClose,
      closeModalWindow,
    };
  },
};
</script>

<style scoped>
.modal-window {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(0, 0, 0, 0.5);
  overflow: auto;
}

.modal-window__content {
  position: relative;

  width: 250px;
  min-height: 350px;

  text-align: center;

  background-color: #010b25;
  color: #fff;
  border: solid #192847 5px;
  border-radius: 15px;
}
.modal-window__wrapper {
  height: 250px;
  overflow: auto;
}
.modal-window__footer {
  position: absolute;
  left: 0;
  bottom: 0;

  padding: 5px 0;

  background-color: #041d57;
  color: #4c8cd0;
  width: 100%;
}
.modal-window__title {
  padding: 10px 10px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;

  font-size: 15px;

  background-color: #041d57;
  color: #4c8cd0;
}

.modal-window__title > h2 {
  margin: 0;
}

.modal-window__timer {
  position: absolute;
  right: 0;
  top: 0;

  padding: 5px 10px;

  font-size: 20px;
}

.modal-window__close {
  position: absolute;
  top: 0;
  right: 0;

  font-size: 20px;

  border: none;
  outline: none;
  color: #4c8cd0;
  background: none;
}
</style>
