<script lang="ts">
  import { debug, editItem, editMode, items } from "../store";
  import type { Item } from "../store";

  export const getNonce = () => {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  export const changedName = (item: Item, isEditItem: boolean) => {
    if (!isEditItem) {
      let i = $items.customSnippets.filter((x) => {
        if (x.id === item.id) {
          x.name = item.name;
          if ($debug) console.log(x);
        } else {
          x = x;
        }
        return x;
      });
      //tsvscode.setState({ i });
      $items.customSnippets = [...i];
    } else {
      let i: Item = $editItem;
      i.name = item.name;
      //tsvscode.setState({ i });
      $editItem = i;
    }
  };

  export const ChangeLanguage = (e) => {
    $editItem.language = e.target.value;
  }

  export const changeColor = (e: any, item: Item, isEditItem: boolean) => {
    if ($debug) {
      console.log(e);
      console.log(item);
    }
    item.color = e.target.value;

    if (isEditItem) {
      $items.customSnippets = $items.customSnippets.map((i) => {
        if (i.id === item.id) {
          i.color = item.color;
        }
        return i;
      });
    } else {
      let i = $editItem;
      i.color = item.color;
      $editItem = i;
    }

    // document.getElementById(item.id)?.getElementsByClassName('colorInput')[0].classList.toggle('hide')
  };

  export const changeTags = (e: any, item: Item, isEditItem: boolean) => {
    if ($debug) {
      console.log(e);
      console.log(item);
    }

    if (!isEditItem) {
      $items.customSnippets = $items.customSnippets.map((i) => {
        if (i.id === item.id) {
          var array = e.target.value.split(",");
          i.tags = array;
        } else {
          i = i;
        }
        return i;
      });
    } else {
      let i = $editItem;
      var array = e.target.value.split(",");
      i.tags = array;
      $editItem = i;
    }
  };

  export const updateTagView = () => {
    let selectedTags = $items.selectedTags ?? [];

    let i = $items.customSnippets.filter((item) => {
        let found = 0;

        if (typeof item.tags !== "undefined" && typeof $items.selectedTags !== "undefined") {
          if (selectedTags.length === 0) {
            //EMTPY
            item.visible = "";
            return item;
          } else {
            //NOT EMTPY

            selectedTags.forEach((selectedTag) => {
              if (item.tags.findIndex((tagName) => tagName.toUpperCase().includes(selectedTag)) !== -1) {
                // x.visible = "";
                found = ++found;
              } else {
                //x.visible = "None";
              }
            });
          }
        }

        if (found > 0) {
          item.visible = "";
        } else {
          item.visible = "None";
        }

        return item;
      });

      $items.customSnippets = [...i];
  }
</script>

<main>

</main>

<style>
</style>
