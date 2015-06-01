![polymer autocomplete logo](https://cloud.githubusercontent.com/assets/3482679/7901748/3685cfb6-0798-11e5-8865-6106193cc2e4.png)  

## Polymer Autocomplete Package

Polymer element tag and attribute autocompletions in Atom.


:movie_camera: [Preview video of autocomplete-polymer in action](https://dl.dropboxusercontent.com/u/6808702/autocomplete-polymer-preview.mp4)

### Package Installation
From the Atom editor menus, navigate to `Atom -> Preferences`.  
Click on the install tab and enter `autocomplete-polymer` in the search field.  

### Usage guide
For the package to offer autocompletion hints it needs to have a list of the possible elements
in your current project. This is saved within a file in your projects root directory named `.ac-poly.json`. This file needs to built for each polymer project and updated when elements are changed or added (including bower components). It is recommended that the file is added to your `.gitignore`.  

Whenever you need to build / update the autocompletion dictionary (`.ac-poly.json`) then run the `Update Project Completions Dictionary` command in the autocomplete-polymer package menu (`Packages  ->  Autocomplete Polymer`) in the top toolbar.  
You can also call `Autocomplete Polymer:Update` from the command palette (`cmd + shift + p`) or use the keyboard shortcut `ctrl + alt + p`.

### How it works
The package builds a list of autocompletions by:
- Scanning your projects directory for all `js` and `html` files that are not within a folder named `test` or `demo`.
- then it searches through those files for the Polymer element registration calls (`Polymer({ is: '...'})`).
- The identified scripts containing the Polymer calls are then parsed and analysed by `esprima` such that we can pull out the elements names and a list of it's properties.
- A JSON object is written to the projects root folder which contains all the element names and the properties associated with those elements.

### Important Notes
- Probably not compatible with atom projects which have multiple root folders.
- Will ignore any files placed within a `test` or `demo` folder.
- Only scans `js` and `html` files.
- Required to run the update command whenever there is a need to refresh the completions dictionary.

### Recommended Packages for Atom
- For Polymer snippets check out: [atom-polymer](https://atom.io/packages/atom-polymer)  
- Html autocompletions: [autocomplete-html](https://atom.io/packages/autocomplete-html)  
- Automatic closing of html tags: [autoclose-html](https://atom.io/packages/autoclose-html)  
- File path autocompletions: [autocomplete-paths](https://atom.io/packages/autocomplete-paths)
- Html code linter: [linter-htmlhint](https://atom.io/packages/linter-htmlhint)


### Acknowledgements
This project is a fork of the [autocomplete-html](https://github.com/atom/autocomplete-html) project.  The project makes use of [scandal](https://github.com/atom/scandal) for directory scanning and file searching, [esprima](http://http://esprima.org/) for the javascript analysis and [estraverse](https://github.com/estools/estraverse) for the transversal of the abstract syntax tree.

### Bugs, Improvements, Requests
Please add an issue in the GitHub repository if you find any bugs, have improvement ideas, or requests.

### Contributing
Any pull requests will be greatly welcome since I'm sure there is plenty of room for improvement.

### Author
Mark Silverwood
