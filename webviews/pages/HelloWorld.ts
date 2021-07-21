import App from "../components/Home.svelte";

const app = new App({
  target: document.body,
  props:{
    isSidebar: false
  }
});

export default app;