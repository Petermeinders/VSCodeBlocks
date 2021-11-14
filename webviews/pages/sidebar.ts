import App from "../components/Home/Home.svelte";

const app = new App({
  target: document.body,
  props:{
    isSidebar: true
  }
});

export default app;