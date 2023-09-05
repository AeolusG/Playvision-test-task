<template>
  <div class="popup" v-if="show">
    <div class="popup__content">
      <header class="popup__title">
        <h2>{{ title }}</h2>
        <slot name="close" v-if="typeOfClosing === 'timer'"></slot>
        <slot name="close" v-if="typeOfClosing === 'cross'"></slot>
      </header>
      <slot name="content"></slot>
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    typeOfClosing: {
      type: String,
      default: 'none',
    },
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Sample Text',
    },
  },
};
</script>

<style lang="css">
.popup {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: fixed;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
}
.popup__content {
  position: absolute;
  top: 20%;
  left: 45%;
  text-align: center;
  background-color: #010b25;
  color: #fff;
  border: solid #192847 5px;
  border-radius: 15px;
  width: 250px;
  min-height: 300px;
}
.popup__title {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  background-color: #041d57;
  padding: 10px 0px;
  color: #4c8cd0;
  font-size: 20px;
}
.popup__title > h2 {
  margin: 0;
}
</style>
