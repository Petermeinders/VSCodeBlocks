import App from "../components/Sidebar.svelte";

const app = new App({
  target: document.body,
  props:{
    isSidebar: true
  }
});

export default app;