import { xlink_attr } from "svelte/internal";
import { writable, derived } from "svelte/store";

// export const items = writable([{id:0,name:""}]);
let originItems = [{ id: "0", name: "test", code:"...", color:'white', visible:"", tags:["tag1","tag2"] },{ id: "1", name: "test2", code:"...2", color:'white', visible:"", tags:["tag1","tag2"] }];
let originTags = [{id: 1, tagName:"code"}, {id: 2, tagName:"command"}];
let originPage: "code" | "other" = "code";


if (tsvscode.getState()?.i !== undefined) {
  originItems = tsvscode.getState()?.i;
}
// if (tsvscode.getState()?.t.length > 0){
//   originTags = tsvscode.getState()?.t;
//   originTags = ["None", ...originTags];
// }
if (tsvscode.getState()?.p !== undefined){
  originPage = tsvscode.getState()?.p;
}

tsvscode.setState(originItems, originTags, originPage );


// if (tsvscode.getState()?.t !== undefined) {
//   originTags =  tsvscode.getState()?.t;
//   tsvscode.setState(originTags);
// }

const addItem = () => {
  
}


export const items = writable(originItems, (set) => {
  console.log("Store Code Block Items Set!");
  console.log(originItems);
 
  //set([{id:0, name:""}]);
  return () => {};
});

// export const tags = writable(originTags, (set) => {
//   console.log("Store Tags Set!");
//   console.log(originTags);
 
//   return () => {};
// });

export const tags = derived(
	items,
	$items => {
    let s = new Set($items.map(item => item.tags).flat());
    s = ["None", ...s];
    return Array.from(s);
  }
  

);

export const page = writable(originPage, (set) => {
  console.log("Store Tags Set!");
  console.log(originPage);
 
  return () => {};
});
