<template>
  <TheModalWindow
    v-if="modalWindow1.shown.value"
    @close-modal-window="modalWindow1.changeVisibility"
    :typeOfClosing="modalWindow1.typeOfClosing.value"
    :timeLeft="modalWindow1.timeLeft.value"
    :title="modalWindow1.title.value"
    :windowWidth="modalWindow1.windowWidth.value"
  >
    <template v-slot:content>
      <!-- <img src="./assets/images/chips.png" alt="chips" class="chips" /> -->
      <div class="content">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </div>
    </template>
  </TheModalWindow>
  <TheModalWindow
    v-if="modalWindow2.shown.value"
    @close-modal-window="modalWindow2.changeVisibility"
    :typeOfClosing="modalWindow2.typeOfClosing.value"
    :title="modalWindow2.title.value"
    :windowWidth="modalWindow2.windowWidth.value"
  >
    <template v-slot:content>
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          fill="currentColor"
          class="bi bi-flag custom-flag"
          viewBox="0 0 16 16"
        >
          <path
            d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001M14 1.221c-.22.078-.48.167-.766.255-.81.252-1.872.523-2.734.523-.886 0-1.592-.286-2.203-.534l-.008-.003C7.662 1.21 7.139 1 6.5 1c-.669 0-1.606.229-2.415.478A21.294 21.294 0 0 0 3 1.845v6.433c.22-.078.48-.167.766-.255C4.576 7.77 5.638 7.5 6.5 7.5c.847 0 1.548.28 2.158.525l.028.01C9.32 8.29 9.86 8.5 10.5 8.5c.668 0 1.606-.229 2.415-.478A21.317 21.317 0 0 0 14 7.655V1.222z"
          />
        </svg>
        <h2>Заголовок окна</h2>
        <div class="content">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </div>
      </div>
    </template>

    <template v-slot:footer>
      <div class="btns">
        <button @click="modalWindow2.changeVisibility" class="btn btn-red">
          Ясно
        </button>
        <button @click="modalWindow2.changeVisibility" class="btn btn-green">
          Ясно
        </button>
      </div>
    </template>
  </TheModalWindow>
  <TheModalWindow
    v-if="modalWindow3.shown.value"
    @close-modal-window="modalWindow3.changeVisibility"
    :title="modalWindow3.title.value"
    :windowWidth="modalWindow3.windowWidth.value"
  >
    <template v-slot:content>
      <div class="content">
        <svg
          style="color: white"
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          fill="currentColor"
          class="bi bi-exclamation-octagon-fill"
          viewBox="0 0 16 16"
        >
          <path
            d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
            fill="white"
          ></path>
        </svg>
        <h2 class="warning">Ваш аккаунт заблокирован</h2>
        <div class="content align">
          Доступ к приложению временно ограничен по следующим причинам:
        </div>
        <ul class="list">
          <li>1. Оскорбление участников игрового сообщества</li>
          <li>2. Покупка фишек в обход игрового магазина</li>
          <li>3. Использование аватара неподобающего содержания</li>
        </ul>
        <div>Дата разблокировки 21.10.2045</div>
      </div>
    </template>
    <template v-slot:footer>
      <button @click="modalWindow3.changeVisibility" class="btn btn-green">
        Ознакомлен
      </button>
    </template>
  </TheModalWindow>
  <TheModalWindow
    v-if="modalWindow4.shown.value"
    @close-modal-window="modalWindow4.changeVisibility"
    :title="modalWindow4.title.value"
    :windowWidth="modalWindow4.windowWidth.value"
    :typeOfClosing="modalWindow4.typeOfClosing.value"
  >
    <template v-slot:content>
      <div class="content">
        <div class="content">
          Ваш email, на который мы пришлем вам электронный чек
        </div>
        <input v-model="email" @input="isValid" type="email" />
        <div class="warning" v-if="!valid">
          Это поле обязательно для заполнения
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <button v-if="!valid" class="btn btn-grey">Далее</button>
      <button
        v-if="valid"
        @click="modalWindow4.changeVisibility"
        class="btn btn-green"
      >
        Далее
      </button>
    </template>
  </TheModalWindow>
  <div class="btnsToShow">
    <button @click="modalWindow1.changeVisibility" class="button">
      Модальное окно с таймером
    </button>
    <button @click="modalWindow2.changeVisibility" class="button">
      Модальное окно с футером
    </button>
    <button @click="modalWindow3.changeVisibility" class="button">
      Модальное окно с блокировкой
    </button>
    <button @click="modalWindow4.changeVisibility" class="button">
      Модальное окно для введения почты
    </button>
  </div>
</template>

<script>
import { useModal } from './use/useModal';
import typeOfClosing from './enums/typeOfClosing';

export default {
  setup() {
    const modalWindowConfig1 = {
      shown: false,
      title: 'Название окна',
      typeOfClosing: typeOfClosing.TIMER,
      timeLeft: 30,
      windowWidth: 300,
    };
    const modalWindowConfig2 = {
      shown: false,
      title: 'Название окна',
      windowWidth: 300,
    };
    const modalWindowConfig3 = {
      shown: false,
      title: 'Временная блокировка',
      windowWidth: 300,
    };
    let email = ref('');

    const modalWindowConfig4 = {
      shown: false,
      title: 'Почта для чека',
      typeOfClosing: typeOfClosing.CLOSE,
      windowWidth: 300,
    };
    const modalWindow1 = useModal(modalWindowConfig1);
    const modalWindow2 = useModal(modalWindowConfig2);
    const modalWindow3 = useModal(modalWindowConfig3);
    const modalWindow4 = useModal(modalWindowConfig4);

    let valid = ref(false);
    const isValid = () => {
      valid.value = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
        email.value
      );
    };

    return {
      modalWindow1,
      modalWindow2,
      modalWindow3,
      modalWindow4,
      email,
      isValid,
      valid,
    };
  },
};
</script>

<style scoped>
.content {
  padding: 10px 15px;
  margin-top: 35px;
}
.align {
  text-align: left;
}
.custom-flag {
  padding-top: 20px;
}
.chips {
  width: auto;
  max-width: 50%;
}
.btns {
  display: flex;
  justify-content: space-around;
}
.btn {
  border: none;
  outline: none;
  color: #fff;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
}
.btn-green {
  background: radial-gradient(#00760a, #02e616);
}
.btn-green:hover {
  background: radial-gradient(#069912, #36ee46);
}
.btn-red {
  background: radial-gradient(#490000, #b43636);
}
.btn-grey {
  background: radial-gradient(rgb(44, 44, 44), #979797);
}

.list {
  text-align: left;
  padding: 0;
  font-size: 15px;
}
.list > li {
  list-style-type: none;
  padding: 5px;
}

input {
  width: 200px;
  height: 20px;
  margin-top: 20px;

  background: none;
  color: white;
  border: solid 2px #4c8cd0;
  border-radius: 8px;
}
.warning {
  color: rgb(243, 59, 59);
  font-weight: bold;
  margin: 0;
}
.btnsToShow {
  margin: auto;
  margin-top: 50px;
  width: 900px;

  display: flex;
  justify-content: space-between;
}
.button {
  width: 200px;
  padding: 10px;

  border: none;
  outline: none;
  border: solid 3px;
  border-radius: 12px;

  font-size: 20px;
  font-weight: bold;

  background-color: #041d57;
  color: #4c8cd0;
  cursor: pointer;
}
.button:hover {
  color: #a3ccf8;
  transition: ease 0.7s;
}
</style>
