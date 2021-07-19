<script>
	// import Nested from './Dnd.svelte';
	// import Board from './Board.svelte';


  let items1 = [
		{id: 11, name: "item11"},
		{id: 12, name: "item12"},
		{id: 13, name: "item13"},
		{id: 14, name: "item14"},
	]; 

	let board = [
		{
			id: 1,
			name: "TODO",
			items: [
				{id: 41, name: "item41"},
				{id: 42, name: "item42"},
				{id: 43, name: "item43"},
				{id: 44, name: "item44"},
				{id: 45, name: "item45"},
				{id: 46, name: "item46"},
				{id: 47, name: "item47"},
				{id: 48, name: "item48"},
				{id: 49, name: "item49"}
			]
		},
		{
			id: 2,
			name: "DOING",
			items: []
		},
		{
			id: 3,
			name: "DONE",
			items: []
		}
	];
</script>

<!-- <Nested items = {items1}/> -->
<!-- <Board columnItems = {board}/> -->
<h1>Hello...</h1>

<style>

</style>
