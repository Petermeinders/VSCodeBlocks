<script lang="ts">
    import { debug, editItem, editMode } from "../store";
    import Fa from "svelte-fa";
    import { faTint, faTag, faFont, faPlusCircle, faPencilAlt, faTimesCircle, faSearch } from "@fortawesome/free-solid-svg-icons";
    import Common from "./Common.svelte";
    import Content from './PuzzleContent.svelte'
  
    let common: Common;

	
	let depth=4;
	let nodes={
		node1:{name:'node 1',
					 items:[
						{id: 'node2'},
						{id: 'node3'},
						{id: 'node4'}
					 ],
					 id:'node1'
					},
		node2:{name:'node 2',
					 items:[
						 {id: 'node5'},
						 {id: 'node6'},
						 {id: 'node7'},
						 {id: 'node8'}
					 ],
					 id:'node2'
					},
		node3:{name:'node 3',
					 items:[
						 {id: 'node9'},
						 {id: 'node10'},
						 {id: 'node11'},
						 {id: 'node12'}
					 ],
					 id:'node3'
					},
		node4:{name:'node 4',
					 items:[
						 {id: 'node13'},
						 {id: 'node14'},
						 {id: 'node15'},
						 {id: 'node16'}
					 ],
					 id:'node4',
					 color: 'salmon'
					},
	}
		
for (let i = 5; i < 17; i++) {
  nodes[`node${i}`]={id:`node${i}`, name:`item ${i}`}
}

nodes['node10'].color='steelblue'
	nodes['node11'].color='steelblue'
	nodes['node14'].color='orange'
	nodes['node15'].color='orange'
	nodes['node6'].color='forestgreen'
  
  </script>
  
  <main>
    <Common bind:this={common} />
    <div>
        <Content node={nodes.node1} bind:nodes={nodes} bind:depth={depth}/>
    </div>
    <div>
      <button on:click={() => CreateTabStop()}>Selection to tabstop </button>
  
   
    </div>
  
    <div>
     
    </div>
  
  </main>
  
  <style>
    .tooltip {
      position: relative;
      display: inline-block;
      /* border-bottom: 1px dotted black; */
    }
  
    .tooltip .tooltiptext {
      visibility: hidden;
      width: 120px;
      background-color: black;
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 5px 0;
  
      /* Position the tooltip */
      position: absolute;
      top: -25px;
      left: 45px;
      z-index: 1;
    }
  
    .tooltip:hover .tooltiptext {
      visibility: visible;
    }
  </style>
  