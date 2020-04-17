/* Imports */
const customTitlebar = require('custom-electron-titlebar');
let titleBar
let macTitleBar
require('jquery')
require('hammerjs')
require('materialize-css')

/* Variables */
let selectionRange;

/* Adjustments for Mac */
if(process.platform === 'darwin'){
  bodyDOM = document.body
  macTitleBar = document.createElement("DIV");
  macTitleBar.innerText = 'CleanText'
  macTitleBar.id = 'macTitleBar'
  bodyDOM.prepend(macTitleBar)
  appContainerDom = document.getElementById('appContainer')
  appContainerDom.style.border = 'none'
}


setTimeout(function() {
    document.getElementById('editor').focus();
}, 0);

/* Title Bar */
if(process.platform != 'darwin'){
  titleBar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#ffffff'),
    shadow: true
  });
  titleBar.updateTitle('CleanText');
}

const {ipcRenderer} = require('electron');

/* Display Document Content */
ipcRenderer.on('fileOpen:content', (e, data) => {
  document.getElementById('editor').innerHTML = data
});

/* Set file name */
ipcRenderer.on('fileOpen:name', (e, data) => {
  const titleText = data + ' - CleanText'
  if(process.platform === 'darwin'){
    document.getElementById('macTitleBar').innerText = titleText
  }
  titleBar.updateTitle(titleText)
});

/* Give document content to mainprocess to save to file */
ipcRenderer.on('requestSave', (e, data) => {
  documentData = document.getElementById('editor').innerHTML;
  ipcRenderer.send('fileSave:content', documentData)
});

/* Displays file name on titlebar when saving */
ipcRenderer.on('fileSaved:name', (e, data) => {
  const titleText = data + ' - CleanText'
  if(process.platform === 'darwin'){
    document.getElementById('macTitleBar').innerText = titleText
  }
  titleBar.updateTitle(titleText)
});

/* Formats the text upon receiving a command */
ipcRenderer.on('formatCommand', (e, command) => {
    document.execCommand('removeFormat')
    document.execCommand(command);
});

/* Formats the text upon receiving a command with arguments */
ipcRenderer.on('formatCommandWithArgs', (e, data) => {
  document.execCommand('removeFormat')
  document.execCommand(data.command, false, data.arguments);
});

executeCommand = (command, arg) => {
  document.execCommand('removeFormat')
  if(!arg){
    document.execCommand(command)
  }
  else{
    document.execCommand(command, false, arg)
  }
}

/* https://gist.github.com/dantaex/543e721be845c18d2f92652c0ebe06aa */

saveSelection= () =>  {
  if (window.getSelection) {
      var sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
          return sel.getRangeAt(0);
      }
  } else if (document.selection && document.selection.createRange) {
      return document.selection.createRange();
  }
  return null;
}

restoreSelection = (range) => {
  if (range) {
      if (window.getSelection) {
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
      } else if (document.selection && range.select) {
          range.select();
      }
  }
}

/* https://gist.github.com/dantaex/543e721be845c18d2f92652c0ebe06aa */

/* Saves Selection for Inserting Items from Modals */
saveSel = () =>{
  selectionRange = saveSelection();
  console.log(selectionRange)
}

/* Inserts an Image into the document */
insertImage = () => {
  restoreSelection(selectionRange);
  imageSource = document.getElementById("image_url_input").value;
  if(imageSource != '' && imageSource != 'null'){
    console.log('Valid URL')
    console.log(imageSource)
    document.execCommand('insertImage', false, imageSource)
  }
}


/*Format Dropdown*/
$('.formatSelectTrigger').dropdown({
  inDuration: 300,
  outDuration: 225,
  alignment: 'left', // Displays dropdown with edge aligned to the left of button
  constrainWidth: false,
  coverTrigger: false,
  onCloseEnd: () => {
    var editor = document.getElementById('editor');
    setTimeout(function() {
      editor.focus();
    }, 0);
  }
}
);


/* Image Insert Modal */
$(document).ready(function(){
  $('.modal').modal();
});



/* UI Autohide */
var i = null;
$("#appContainer").mousemove(function() {
    $("#controlPanel").stop().fadeTo('fast', 1);
    i = setTimeout(() => {
      $("#controlPanel").stop().fadeTo('slow', 0);
    }, 5000);
})