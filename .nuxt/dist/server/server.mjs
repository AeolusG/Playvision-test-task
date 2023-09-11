import { reactive, hasInjectionContext, getCurrentInstance, toRef, isRef, inject, h, isReadonly, isShallow, isReactive, toRaw, mergeProps, useSSRContext, ref, withCtx, createVNode, openBlock, createBlock, withDirectives, vModelText, createCommentVNode, unref, defineAsyncComponent, provide, onErrorCaptured, onServerPrefetch, resolveDynamicComponent, createApp } from "vue";
import { $fetch } from "ofetch";
import { useRuntimeConfig as useRuntimeConfig$1 } from "#internal/nitro";
import { createHooks } from "hookable";
import { getContext } from "unctx";
import { withQuery, hasProtocol, parseURL, isScriptProtocol, joinURL, isEqual, stringifyParsedURL, stringifyQuery, parseQuery } from "ufo";
import { sanitizeStatusCode, createError as createError$1 } from "h3";
import "devalue";
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate, ssrRenderComponent, ssrRenderSlot, ssrRenderAttr, ssrRenderSuspense, ssrRenderVNode } from "vue/server-renderer";
const appConfig = useRuntimeConfig$1().app;
const baseURL = () => appConfig.baseURL;
const nuxtAppCtx = /* @__PURE__ */ getContext("nuxt-app", {
  asyncContext: false
});
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.7.0";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: reactive({
      data: {},
      state: {},
      _errors: {},
      ...{ serverRendered: true }
    }),
    static: {
      data: {}
    },
    runWithContext: (fn) => callWithNuxt(nuxtApp, fn),
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: {},
    _payloadRevivers: {},
    ...options
  };
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    async function contextCaller(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    }
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  {
    if (nuxtApp.ssrContext) {
      nuxtApp.ssrContext.nuxt = nuxtApp;
      nuxtApp.ssrContext._payloadReducers = {};
      nuxtApp.payload.path = nuxtApp.ssrContext.url;
    }
    nuxtApp.ssrContext = nuxtApp.ssrContext || {};
    if (nuxtApp.ssrContext.payload) {
      Object.assign(nuxtApp.payload, nuxtApp.ssrContext.payload);
    }
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: options.ssrContext.runtimeConfig.public,
      app: options.ssrContext.runtimeConfig.app
    };
  }
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
async function applyPlugin(nuxtApp, plugin) {
  if (plugin.hooks) {
    nuxtApp.hooks.addHooks(plugin.hooks);
  }
  if (typeof plugin === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  var _a, _b;
  const parallels = [];
  const errors = [];
  for (const plugin of plugins2) {
    if (((_a = nuxtApp.ssrContext) == null ? void 0 : _a.islandContext) && ((_b = plugin.env) == null ? void 0 : _b.islands) === false) {
      continue;
    }
    const promise = applyPlugin(nuxtApp, plugin);
    if (plugin.parallel) {
      parallels.push(promise.catch((e) => errors.push(e)));
    } else {
      await promise;
    }
  }
  await Promise.all(parallels);
  if (errors.length) {
    throw errors[0];
  }
}
/*! @__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin) {
  if (typeof plugin === "function") {
    return plugin;
  }
  delete plugin.name;
  return Object.assign(plugin.setup || (() => {
  }), plugin, { [NuxtPluginIndicator]: true });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => args ? setup(...args) : setup();
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
/*! @__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function useNuxtApp() {
  var _a;
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = (_a = getCurrentInstance()) == null ? void 0 : _a.appContext.app.$nuxt;
  }
  nuxtAppInstance = nuxtAppInstance || nuxtAppCtx.tryUse();
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
/*! @__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig() {
  return (/* @__PURE__ */ useNuxtApp()).$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxt = /* @__PURE__ */ useNuxtApp();
  const state = toRef(nuxt.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxt.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
const PageRouteSymbol = Symbol("route");
const useRouter = () => {
  var _a;
  return (_a = /* @__PURE__ */ useNuxtApp()) == null ? void 0 : _a.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, (/* @__PURE__ */ useNuxtApp())._route);
  }
  return (/* @__PURE__ */ useNuxtApp())._route;
};
const isProcessingMiddleware = () => {
  try {
    if ((/* @__PURE__ */ useNuxtApp())._processingMiddleware) {
      return true;
    }
  } catch {
    return true;
  }
  return false;
};
const navigateTo = (to, options) => {
  if (!to) {
    to = "/";
  }
  const toPath = typeof to === "string" ? to : withQuery(to.path || "/", to.query || {}) + (to.hash || "");
  if (options == null ? void 0 : options.open) {
    return Promise.resolve();
  }
  const isExternal = (options == null ? void 0 : options.external) || hasProtocol(toPath, { acceptRelative: true });
  if (isExternal) {
    if (!(options == null ? void 0 : options.external)) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const protocol = parseURL(toPath).protocol;
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = /* @__PURE__ */ useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      async function redirect(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = location2.replace(/"/g, "%22");
        nuxtApp.ssrContext._renderResponse = {
          statusCode: sanitizeStatusCode((options == null ? void 0 : options.redirectCode) || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: location2 }
        };
        return response;
      }
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    if (options == null ? void 0 : options.replace) {
      location.replace(toPath);
    } else {
      location.href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  return (options == null ? void 0 : options.replace) ? router.replace(to) : router.push(to);
};
const useError = () => toRef((/* @__PURE__ */ useNuxtApp()).payload, "error");
const showError = (_err) => {
  const err = createError(_err);
  try {
    const nuxtApp = /* @__PURE__ */ useNuxtApp();
    const error = useError();
    if (false)
      ;
    error.value = error.value || err;
  } catch {
    throw err;
  }
  return err;
};
const clearError = async (options = {}) => {
  const nuxtApp = /* @__PURE__ */ useNuxtApp();
  const error = useError();
  nuxtApp.callHook("app:error:cleared", options);
  if (options.redirect) {
    await useRouter().replace(options.redirect);
  }
  error.value = null;
};
const isNuxtError = (err) => !!(err && typeof err === "object" && "__nuxt_error" in err);
const createError = (err) => {
  const _err = createError$1(err);
  _err.__nuxt_error = true;
  return _err;
};
const globalMiddleware = [];
function getRouteFromPath(fullPath) {
  if (typeof fullPath === "object") {
    fullPath = stringifyParsedURL({
      pathname: fullPath.path || "",
      search: stringifyQuery(fullPath.query || {}),
      hash: fullPath.hash || ""
    });
  }
  const url = parseURL(fullPath.toString());
  return {
    path: url.pathname,
    fullPath,
    query: parseQuery(url.search),
    hash: url.hash,
    // stub properties for compat with vue-router
    params: {},
    name: void 0,
    matched: [],
    redirectedFrom: void 0,
    meta: {},
    href: fullPath
  };
}
const router_CaKIoANnI2 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  setup(nuxtApp) {
    const initialURL = nuxtApp.ssrContext.url;
    const routes = [];
    const hooks = {
      "navigate:before": [],
      "resolve:before": [],
      "navigate:after": [],
      error: []
    };
    const registerHook = (hook, guard) => {
      hooks[hook].push(guard);
      return () => hooks[hook].splice(hooks[hook].indexOf(guard), 1);
    };
    const baseURL2 = (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const route = reactive(getRouteFromPath(initialURL));
    async function handleNavigation(url, replace) {
      try {
        const to = getRouteFromPath(url);
        for (const middleware of hooks["navigate:before"]) {
          const result = await middleware(to, route);
          if (result === false || result instanceof Error) {
            return;
          }
          if (result) {
            return handleNavigation(result, true);
          }
        }
        for (const handler of hooks["resolve:before"]) {
          await handler(to, route);
        }
        Object.assign(route, to);
        if (false)
          ;
        for (const middleware of hooks["navigate:after"]) {
          await middleware(to, route);
        }
      } catch (err) {
        for (const handler of hooks.error) {
          await handler(err);
        }
      }
    }
    const router = {
      currentRoute: route,
      isReady: () => Promise.resolve(),
      // These options provide a similar API to vue-router but have no effect
      options: {},
      install: () => Promise.resolve(),
      // Navigation
      push: (url) => handleNavigation(url, false),
      replace: (url) => handleNavigation(url, true),
      back: () => window.history.go(-1),
      go: (delta) => window.history.go(delta),
      forward: () => window.history.go(1),
      // Guards
      beforeResolve: (guard) => registerHook("resolve:before", guard),
      beforeEach: (guard) => registerHook("navigate:before", guard),
      afterEach: (guard) => registerHook("navigate:after", guard),
      onError: (handler) => registerHook("error", handler),
      // Routes
      resolve: getRouteFromPath,
      addRoute: (parentName, route2) => {
        routes.push(route2);
      },
      getRoutes: () => routes,
      hasRoute: (name) => routes.some((route2) => route2.name === name),
      removeRoute: (name) => {
        const index = routes.findIndex((route2) => route2.name === name);
        if (index !== -1) {
          routes.splice(index, 1);
        }
      }
    };
    nuxtApp.vueApp.component("RouterLink", {
      functional: true,
      props: {
        to: String,
        custom: Boolean,
        replace: Boolean,
        // Not implemented
        activeClass: String,
        exactActiveClass: String,
        ariaCurrentValue: String
      },
      setup: (props, { slots }) => {
        const navigate = () => handleNavigation(props.to, props.replace);
        return () => {
          var _a;
          const route2 = router.resolve(props.to);
          return props.custom ? (_a = slots.default) == null ? void 0 : _a.call(slots, { href: props.to, navigate, route: route2 }) : h("a", { href: props.to, onClick: (e) => {
            e.preventDefault();
            return navigate();
          } }, slots);
        };
      }
    });
    nuxtApp._route = route;
    nuxtApp._middleware = nuxtApp._middleware || {
      global: [],
      named: {}
    };
    const initialLayout = useState("_layout");
    nuxtApp.hooks.hookOnce("app:created", async () => {
      router.beforeEach(async (to, from) => {
        var _a;
        to.meta = reactive(to.meta || {});
        if (nuxtApp.isHydrating && initialLayout.value && !isReadonly(to.meta.layout)) {
          to.meta.layout = initialLayout.value;
        }
        nuxtApp._processingMiddleware = true;
        if (!((_a = nuxtApp.ssrContext) == null ? void 0 : _a.islandContext)) {
          const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
          for (const middleware of middlewareEntries) {
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            {
              if (result === false || result instanceof Error) {
                const error = result || createError$1({
                  statusCode: 404,
                  statusMessage: `Page Not Found: ${initialURL}`
                });
                delete nuxtApp._processingMiddleware;
                return nuxtApp.runWithContext(() => showError(error));
              }
            }
            if (result || result === false) {
              return result;
            }
          }
        }
      });
      router.afterEach(() => {
        delete nuxtApp._processingMiddleware;
      });
      await router.replace(initialURL);
      if (!isEqual(route.fullPath, initialURL)) {
        await nuxtApp.runWithContext(() => navigateTo(route.fullPath));
      }
    });
    return {
      provide: {
        route,
        router
      }
    };
  }
});
function definePayloadReducer(name, reduce) {
  {
    (/* @__PURE__ */ useNuxtApp()).ssrContext._payloadReducers[name] = reduce;
  }
}
const reducers = {
  NuxtError: (data) => isNuxtError(data) && data.toJSON(),
  EmptyShallowRef: (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_"),
  EmptyRef: (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_"),
  ShallowRef: (data) => isRef(data) && isShallow(data) && data.value,
  ShallowReactive: (data) => isReactive(data) && isShallow(data) && toRaw(data),
  Ref: (data) => isRef(data) && data.value,
  Reactive: (data) => isReactive(data) && toRaw(data)
};
const revive_payload_server_eJ33V7gbc6 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const reducer in reducers) {
      definePayloadReducer(reducer, reducers[reducer]);
    }
  }
});
const components_plugin_KR1HBZs4kY = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const unhead_KgADcZ0jPj = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    nuxtApp.vueApp.use(head);
  }
});
const plugins = [
  router_CaKIoANnI2,
  revive_payload_server_eJ33V7gbc6,
  components_plugin_KR1HBZs4kY,
  unhead_KgADcZ0jPj
];
const TheCloseButton_vue_vue_type_style_index_0_scoped_49942b70_lang = "";
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$4 = {};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs) {
  _push(`<button${ssrRenderAttrs(mergeProps({ class: "close-btn" }, _attrs))} data-v-49942b70><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16" data-v-49942b70><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" data-v-49942b70></path></svg></button>`);
}
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TheCloseButton.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["ssrRender", _sfc_ssrRender$2], ["__scopeId", "data-v-49942b70"]]);
var typeOfClosing = /* @__PURE__ */ ((typeOfClosing2) => {
  typeOfClosing2["TIMER"] = "timer";
  typeOfClosing2["CLOSE"] = "close";
  return typeOfClosing2;
})(typeOfClosing || {});
const TheModalWindow_vue_vue_type_style_index_0_scoped_bae76db8_lang = "";
const _sfc_main$3 = {
  components: {
    TheCloseButton: __nuxt_component_0$1
  },
  props: {
    timeLeft: {
      type: Number,
      default: 10
    },
    typeOfClosing: {
      type: String,
      default: null
    },
    title: {
      type: String
    },
    windowWidth: {
      type: Number,
      default: 250
    }
  },
  emits: ["closeModalWindow"],
  setup(props, { emit }) {
    let isTimer = ref(props.typeOfClosing === typeOfClosing.TIMER);
    let isClose = ref(props.typeOfClosing === typeOfClosing.CLOSE);
    let isShown = ref(false);
    let countdown = ref(props.timeLeft);
    setInterval(() => countdown.value--, 1e3);
    function closeModalWindow() {
      emit("closeModalWindow", isShown);
    }
    return {
      countdown,
      isTimer,
      isClose,
      closeModalWindow
    };
  }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_TheCloseButton = __nuxt_component_0$1;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-window" }, _attrs))} data-v-bae76db8><div class="modal-window__content" style="${ssrRenderStyle({ width: $props.windowWidth + "px" })}" data-v-bae76db8><header class="modal-window__title" data-v-bae76db8><h2 data-v-bae76db8>${ssrInterpolate($props.title)}</h2>`);
  if ($setup.isTimer) {
    _push(`<div class="modal-window__timer" data-v-bae76db8>${ssrInterpolate($setup.countdown)}</div>`);
  } else {
    _push(`<!---->`);
  }
  if ($setup.isClose) {
    _push(`<div class="modal-window__close" data-v-bae76db8>`);
    _push(ssrRenderComponent(_component_TheCloseButton, { onClick: $setup.closeModalWindow }, null, _parent));
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</header><div class="modal-window__wrapper" data-v-bae76db8>`);
  ssrRenderSlot(_ctx.$slots, "content", {}, null, _push, _parent);
  _push(`</div><div class="modal-window__footer" data-v-bae76db8>`);
  ssrRenderSlot(_ctx.$slots, "footer", {}, null, _push, _parent);
  _push(`</div></div></div>`);
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TheModalWindow.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-bae76db8"]]);
function useModal(config = {}) {
  let shown = ref(config.shown);
  let typeOfClosing2 = ref(config.typeOfClosing);
  let title = ref(config.title);
  let timeLeft = ref(config.timeLeft);
  let windowWidth = ref(config.windowWidth);
  const changeVisibility = () => {
    shown.value = !shown.value;
  };
  return {
    shown,
    changeVisibility,
    typeOfClosing: typeOfClosing2,
    title,
    timeLeft,
    windowWidth
  };
}
const _imports_0 = "" + __buildAssetsURL("chips.a3e0394e.png");
const app_vue_vue_type_style_index_0_scoped_f508c6a2_lang = "";
const _sfc_main$2 = {
  setup() {
    const modalWindowConfig1 = {
      shown: false,
      title: "Название окна",
      typeOfClosing: typeOfClosing.TIMER,
      timeLeft: 30,
      windowWidth: 300
    };
    const modalWindowConfig2 = {
      shown: false,
      title: "Название окна",
      windowWidth: 300
    };
    const modalWindowConfig3 = {
      shown: false,
      title: "Временная блокировка",
      windowWidth: 300
    };
    let email = ref("");
    const modalWindowConfig4 = {
      shown: false,
      title: "Почта для чека",
      typeOfClosing: typeOfClosing.CLOSE,
      windowWidth: 300
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
      valid
    };
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_TheModalWindow = __nuxt_component_0;
  _push(`<!--[-->`);
  if ($setup.modalWindow1.shown.value) {
    _push(ssrRenderComponent(_component_TheModalWindow, {
      onCloseModalWindow: $setup.modalWindow1.changeVisibility,
      typeOfClosing: $setup.modalWindow1.typeOfClosing.value,
      timeLeft: $setup.modalWindow1.timeLeft.value,
      title: $setup.modalWindow1.title.value,
      windowWidth: $setup.modalWindow1.windowWidth.value
    }, {
      content: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<img${ssrRenderAttr("src", _imports_0)} alt="chips" class="chips" data-v-f508c6a2${_scopeId}><div class="content" data-v-f508c6a2${_scopeId}> Lorem ipsum dolor sit amet, consectetur adipiscing elit </div>`);
        } else {
          return [
            createVNode("img", {
              src: _imports_0,
              alt: "chips",
              class: "chips"
            }),
            createVNode("div", { class: "content" }, " Lorem ipsum dolor sit amet, consectetur adipiscing elit ")
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($setup.modalWindow2.shown.value) {
    _push(ssrRenderComponent(_component_TheModalWindow, {
      onCloseModalWindow: $setup.modalWindow2.changeVisibility,
      typeOfClosing: $setup.modalWindow2.typeOfClosing.value,
      title: $setup.modalWindow2.title.value,
      windowWidth: $setup.modalWindow2.windowWidth.value
    }, {
      content: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<div data-v-f508c6a2${_scopeId}><svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="bi bi-flag custom-flag" viewBox="0 0 16 16" data-v-f508c6a2${_scopeId}><path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001M14 1.221c-.22.078-.48.167-.766.255-.81.252-1.872.523-2.734.523-.886 0-1.592-.286-2.203-.534l-.008-.003C7.662 1.21 7.139 1 6.5 1c-.669 0-1.606.229-2.415.478A21.294 21.294 0 0 0 3 1.845v6.433c.22-.078.48-.167.766-.255C4.576 7.77 5.638 7.5 6.5 7.5c.847 0 1.548.28 2.158.525l.028.01C9.32 8.29 9.86 8.5 10.5 8.5c.668 0 1.606-.229 2.415-.478A21.317 21.317 0 0 0 14 7.655V1.222z" data-v-f508c6a2${_scopeId}></path></svg><h2 data-v-f508c6a2${_scopeId}>Заголовок окна</h2><div class="content" data-v-f508c6a2${_scopeId}> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </div></div>`);
        } else {
          return [
            createVNode("div", null, [
              (openBlock(), createBlock("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                width: "60",
                height: "60",
                fill: "currentColor",
                class: "bi bi-flag custom-flag",
                viewBox: "0 0 16 16"
              }, [
                createVNode("path", { d: "M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001M14 1.221c-.22.078-.48.167-.766.255-.81.252-1.872.523-2.734.523-.886 0-1.592-.286-2.203-.534l-.008-.003C7.662 1.21 7.139 1 6.5 1c-.669 0-1.606.229-2.415.478A21.294 21.294 0 0 0 3 1.845v6.433c.22-.078.48-.167.766-.255C4.576 7.77 5.638 7.5 6.5 7.5c.847 0 1.548.28 2.158.525l.028.01C9.32 8.29 9.86 8.5 10.5 8.5c.668 0 1.606-.229 2.415-.478A21.317 21.317 0 0 0 14 7.655V1.222z" })
              ])),
              createVNode("h2", null, "Заголовок окна"),
              createVNode("div", { class: "content" }, " Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ")
            ])
          ];
        }
      }),
      footer: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<div class="btns" data-v-f508c6a2${_scopeId}><button class="btn btn-red" data-v-f508c6a2${_scopeId}> Ясно </button><button class="btn btn-green" data-v-f508c6a2${_scopeId}> Ясно </button></div>`);
        } else {
          return [
            createVNode("div", { class: "btns" }, [
              createVNode("button", {
                onClick: $setup.modalWindow2.changeVisibility,
                class: "btn btn-red"
              }, " Ясно ", 8, ["onClick"]),
              createVNode("button", {
                onClick: $setup.modalWindow2.changeVisibility,
                class: "btn btn-green"
              }, " Ясно ", 8, ["onClick"])
            ])
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($setup.modalWindow3.shown.value) {
    _push(ssrRenderComponent(_component_TheModalWindow, {
      onCloseModalWindow: $setup.modalWindow3.changeVisibility,
      title: $setup.modalWindow3.title.value,
      windowWidth: $setup.modalWindow3.windowWidth.value
    }, {
      content: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<div class="content" data-v-f508c6a2${_scopeId}><svg style="${ssrRenderStyle({ "color": "white" })}" xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="bi bi-exclamation-octagon-fill" viewBox="0 0 16 16" data-v-f508c6a2${_scopeId}><path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="white" data-v-f508c6a2${_scopeId}></path></svg><h2 class="warning" data-v-f508c6a2${_scopeId}>Ваш аккаунт заблокирован</h2><div class="content align" data-v-f508c6a2${_scopeId}> Доступ к приложению временно ограничен по следующим причинам: </div><ul class="list" data-v-f508c6a2${_scopeId}><li data-v-f508c6a2${_scopeId}>1. Оскорбление участников игрового сообщества</li><li data-v-f508c6a2${_scopeId}>2. Покупка фишек в обход игрового магазина</li><li data-v-f508c6a2${_scopeId}>3. Использование аватара неподобающего содержания</li></ul><div data-v-f508c6a2${_scopeId}>Дата разблокировки 21.10.2045</div></div>`);
        } else {
          return [
            createVNode("div", { class: "content" }, [
              (openBlock(), createBlock("svg", {
                style: { "color": "white" },
                xmlns: "http://www.w3.org/2000/svg",
                width: "60",
                height: "60",
                fill: "currentColor",
                class: "bi bi-exclamation-octagon-fill",
                viewBox: "0 0 16 16"
              }, [
                createVNode("path", {
                  d: "M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z",
                  fill: "white"
                })
              ])),
              createVNode("h2", { class: "warning" }, "Ваш аккаунт заблокирован"),
              createVNode("div", { class: "content align" }, " Доступ к приложению временно ограничен по следующим причинам: "),
              createVNode("ul", { class: "list" }, [
                createVNode("li", null, "1. Оскорбление участников игрового сообщества"),
                createVNode("li", null, "2. Покупка фишек в обход игрового магазина"),
                createVNode("li", null, "3. Использование аватара неподобающего содержания")
              ]),
              createVNode("div", null, "Дата разблокировки 21.10.2045")
            ])
          ];
        }
      }),
      footer: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<button class="btn btn-green" data-v-f508c6a2${_scopeId}> Ознакомлен </button>`);
        } else {
          return [
            createVNode("button", {
              onClick: $setup.modalWindow3.changeVisibility,
              class: "btn btn-green"
            }, " Ознакомлен ", 8, ["onClick"])
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($setup.modalWindow4.shown.value) {
    _push(ssrRenderComponent(_component_TheModalWindow, {
      onCloseModalWindow: $setup.modalWindow4.changeVisibility,
      title: $setup.modalWindow4.title.value,
      windowWidth: $setup.modalWindow4.windowWidth.value,
      typeOfClosing: $setup.modalWindow4.typeOfClosing.value
    }, {
      content: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<div class="content" data-v-f508c6a2${_scopeId}><div class="content" data-v-f508c6a2${_scopeId}> Ваш email, на который мы пришлем вам электронный чек </div><input${ssrRenderAttr("value", $setup.email)} type="email" data-v-f508c6a2${_scopeId}>`);
          if (!$setup.valid) {
            _push2(`<div class="warning" data-v-f508c6a2${_scopeId}> Это поле обязательно для заполнения </div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
        } else {
          return [
            createVNode("div", { class: "content" }, [
              createVNode("div", { class: "content" }, " Ваш email, на который мы пришлем вам электронный чек "),
              withDirectives(createVNode("input", {
                "onUpdate:modelValue": ($event) => $setup.email = $event,
                onInput: $setup.isValid,
                type: "email"
              }, null, 40, ["onUpdate:modelValue", "onInput"]), [
                [vModelText, $setup.email]
              ]),
              !$setup.valid ? (openBlock(), createBlock("div", {
                key: 0,
                class: "warning"
              }, " Это поле обязательно для заполнения ")) : createCommentVNode("", true)
            ])
          ];
        }
      }),
      footer: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          if (!$setup.valid) {
            _push2(`<button class="btn btn-grey" data-v-f508c6a2${_scopeId}>Далее</button>`);
          } else {
            _push2(`<!---->`);
          }
          if ($setup.valid) {
            _push2(`<button class="btn btn-green" data-v-f508c6a2${_scopeId}> Далее </button>`);
          } else {
            _push2(`<!---->`);
          }
        } else {
          return [
            !$setup.valid ? (openBlock(), createBlock("button", {
              key: 0,
              class: "btn btn-grey"
            }, "Далее")) : createCommentVNode("", true),
            $setup.valid ? (openBlock(), createBlock("button", {
              key: 1,
              onClick: $setup.modalWindow4.changeVisibility,
              class: "btn btn-green"
            }, " Далее ", 8, ["onClick"])) : createCommentVNode("", true)
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="btns-to-show" data-v-f508c6a2><button class="button" data-v-f508c6a2> Модальное окно с таймером </button><button class="button" data-v-f508c6a2> Модальное окно с футером </button><button class="button" data-v-f508c6a2> Модальное окно с блокировкой </button><button class="button" data-v-f508c6a2> Модальное окно для введения почты </button></div><!--]-->`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const AppComponent = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-f508c6a2"]]);
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    (_error.stack || "").split("\n").splice(1).map((line) => {
      const text = line.replace("webpack:/", "").replace(".vue", ".js").trim();
      return {
        text,
        internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
      };
    }).map((i) => `<span class="stack${i.internal ? " internal" : ""}">${i.text}</span>`).join("\n");
    const statusCode = Number(_error.statusCode || 500);
    const is404 = statusCode === 404;
    const statusMessage = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = /* @__PURE__ */ defineAsyncComponent(() => import("./_nuxt/error-404-63d3b648.js").then((r) => r.default || r));
    const _Error = /* @__PURE__ */ defineAsyncComponent(() => import("./_nuxt/error-500-2bb4c74a.js").then((r) => r.default || r));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ statusCode: unref(statusCode), statusMessage: unref(statusMessage), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const ErrorComponent = _sfc_main$1;
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = /* @__PURE__ */ defineAsyncComponent(() => import("./_nuxt/island-renderer-bfb66ee6.js").then((r) => r.default || r));
    const nuxtApp = /* @__PURE__ */ useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = useError();
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(error)) {
            _push(ssrRenderComponent(unref(ErrorComponent), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(AppComponent), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const RootComponent = _sfc_main;
if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(RootComponent);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (err) {
      await nuxt.hooks.callHook("app:error", err);
      nuxt.payload.error = nuxt.payload.error || err;
    }
    if (ssrContext == null ? void 0 : ssrContext._renderResponse) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry$1 = (ctx) => entry(ctx);
export {
  _export_sfc as _,
  createError as c,
  entry$1 as default,
  navigateTo as n,
  useRouter as u
};
//# sourceMappingURL=server.mjs.map
