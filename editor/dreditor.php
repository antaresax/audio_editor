<!DOCTYPE html>
<html>
<head>
    </head>
<body>
<style>
    
  textarea {
    margin: 30px;
}
#txt {
    padding: 20px;
    border-radius: 10px;
    behavior: url('/js/lib/PIE-1.0.0/PIE.htc'); /* for IE6-8 */
    border: 3px solid #ccc;
    outline: none;
}  
    
    
    
    
    
 </style>    
    
    


<textarea id="txt" rows="30" cols="60" NAME="myTextArea" ROWS="5" COLS="80" WRAP="soft"

ONSELECT="saveCurrentPos(this)"

ONCLICK="saveCurrentPos(this)"

ONKEYUP="saveCurrentPos(this)" > 
    <script>
    
    
     var DSX = new window.AudioContext();

    osc = DSX.createOscillator(); 

    gain = DSX.createGain();

    osc.frequency.value = 1300;

    gain.gain.value = 0.1;

    osc.connect(gain);

    gain.connect(DSX.destination);

    osc.start(0);

    osc.stop(1); 
    
    
    
    
    
    
    
    
    
    
    </script>
    

    
    </textarea>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
<script>
$(document).ready(function(){
    $('#hide11').click(function(){
        $('#real').html($('#txt').val());
         
    });
});
    jQuery(function($) {
    $('textarea').autoGrowTextArea();
});
</script>
    <SCRIPT>
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
</SCRIPT>
<button id="hide11">Go</button>
<table>
<tr>
    <td id="real"></td>
</tr>
</table>

</body>
</html>