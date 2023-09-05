<template>
  <TheModalWindow
    :show="isShown"
    :typeOfClosing="closeType"
    :title="anotherTitle"
  >
    <template v-slot:close>
      <div class="timer">
        {{ currentTime }}
      </div>
    </template>
    <template v-slot:content>
      <div class="content">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </div>
    </template>
  </TheModalWindow>
  <button @click="changeVisibility">показать окно</button>
</template>

<script>
export default {
  data: () => {
    return {
      isShown: false,
      closeType: 'none',
      currentTime: null,
      timer: null,
      anotherTitle: 'Divide et impera',
    };
  },

  methods: {
    changeVisibility() {
      this.isShown = true;
      if (this.closeType === 'timer') {
        this.startTimer();
      }
    },
    startTimer() {
      this.currentTime = 6;
      this.timer = setInterval(() => {
        this.currentTime--;
      }, 1000);
    },
    stopTimer() {
      clearTimeout(this.timer);
    },
  },
  watch: {
    currentTime(time) {
      if (time === 0) {
        this.stopTimer();
        this.isShown = false;
      }
    },
  },
};
</script>

<style>
.timer {
  top: 0%;
  position: absolute;
  left: 85%;
  font-size: 20px;
}
.content {
  padding: 10px;
}
</style>
