
$(document).ready(function(){
        $('#hide11').click(function(){

            $('#real').html($('#txt').val());

        });



    	  $('#text_one').click(function(){

          	 $("#txt").val(

          	"<script></script>"
          	);

       });

});
    jQuery(function($) {
    $('textarea').autoGrowTextArea();
});




function saveCurrentPos (objTextArea) {
if (objTextArea.createTextRange)
objTextArea.currentPos = document.selection.createRange().duplicate();
}
function insertText (objTextArea, text) {
if (objTextArea.createTextRange && objTextArea.currentPos) {
var currentPos = objTextArea.currentPos;
currentPos.text =
currentPos.text.charAt(currentPos.text.length - 1) == ' ' ?
text + ' ' : text;
}
else
objTextArea.value = text;
}
function stop(){
 osc.stop();
}
