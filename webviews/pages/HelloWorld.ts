import App from "../components/Sidebar.svelte";

const app = new App({
  target: document.body,
  props:{
    isSidebar: false
  }
});

export default app;