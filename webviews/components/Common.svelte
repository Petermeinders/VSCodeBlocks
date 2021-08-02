<script lang="ts">
  import { debug, editItem, editMode, items } from "../store";
  import type { item } from "../store";


 export const changedName = (item: item, isEditItem: boolean) => {
   if (!isEditItem)
   {
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
   }

  else {
    let i:item = $editItem;
    i.name = item.name;
    //tsvscode.setState({ i });
    $editItem = i;
  }
}
</script>


<main>


</main>






<style>



    
</style>
