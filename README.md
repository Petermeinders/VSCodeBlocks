
# VSCode Blocks

1. VSCode Blocks is partly a VSCode extension for saving off blocks/snippets of your code into searchable/taggable blocks that can be seen and retrieved from a left sidebar. It uses JSON format to store and retrieve previously saved blocks and your store can be shared with others. I'm currently working on refining it and extending functionality further.

2. VSCode Blocks' second part is the ability to build code maps from snippets of code easily and quickly. Essentially providing a visual metadata design to your project. My goal is to keep this code agnostic and efficient to use so that it will enhance a developers day to day work.

## Installation

Easy: Pull down the source code. Install VSIX file into VSCode extensions

To build and export a new package:
Pull down the source code.
Open VSCode and open a terminal.
Navigate to the root project folder and run:

```bash
npm i
```

```bash
npm run vscode:prepublish
```
and then
```bash
vsce package
```

This will create the extension (VSIX file) in the root folder. 
Open you extensions tab and click the ... at the top and "Install from VSIX"

## Usage
You should now have an icon (looks like a circuit board) on the left side.

Add code to sidebar: Drag select code you want to add in VSCode and click the little "Add Code" with a beaker symbol on the bottom notification bar.
Delete code block: Click the little x.
Retrieve code: Double click block to import code into your window at your cursor location.
Search: Type name and press enter.
Rename code blocks: Type in new name and hit enter.
Export code blocks: Click export code button and save off JSON data elsewhere.
Import code blocks: (Warning will overrite current blocks) 1. Open new tab, 2. Paste in json data from export earlier. 3. Highlight all json text. 4. Run command (ctrl + shift + p) "import code json from selection".

More instructions to follow...

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Ben Awad's VSCode extension creation tutorial was a huge help!

https://github.com/isaacHagoel/svelte-dnd-action

## License
[MIT](https://choosealicense.com/licenses/mit/)
