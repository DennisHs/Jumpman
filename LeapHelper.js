var leftKeyEvent = {"keyCode" : 37, "keyDown" : false};
var rightKeyEvent = {"keyCode" : 39, "keyDown" : false};
var upKeyEvent = {"keyCode" : 32, "keyDown" : false};

function changeKeyToUp(key)
{
	if (key["keyDown"] != false)
	{
		key["keyDown"] = false;
		game.handleKeyUp(key);
	}
}

function changeKeyToDown(key)
{
	if (key["keyDown"] != true)
	{
		key["keyDown"] = true;
		game.handleKeyDown(key);
	}
}

function vectorToString(vector, digits)
{
  if (typeof digits === "undefined")
  {
    digits = 1;
  }
  return "(" + vector[0].toFixed(digits) + ", "
             + vector[1].toFixed(digits) + ", "
             + vector[2].toFixed(digits) + ")";
}

// for print leap info
var previousFrame;

function leapCallback(frame)
{	
	if (frame.hands.length > 0)
	{
	    var hand = frame.hands[0];
	    // handle left and right
		if (hand.palmNormal[0] >= 0.4)
		{
			changeKeyToUp(rightKeyEvent);
			changeKeyToDown(leftKeyEvent);
		}
		else if (hand.palmNormal[0] <= -0.4)
		{
			changeKeyToUp(leftKeyEvent);
			changeKeyToDown(rightKeyEvent);
		}
		else
		{
			changeKeyToUp(leftKeyEvent);
			changeKeyToUp(rightKeyEvent);
		}
		
		//handle up
		if (hand.direction[1] >= 0.35)
		{
			changeKeyToDown(upKeyEvent);
		}
		else
		{
			changeKeyToUp(upKeyEvent);
		}
	}
	else
	{
		changeKeyToUp(leftKeyEvent);
		changeKeyToUp(rightKeyEvent);
		changeKeyToUp(upKeyEvent);
	}
	
	//code below is used just for print leap info.
	
  	// Display Frame object data
 	var frameOutput = document.getElementById("frameData");

  	var frameString = "Frame ID: " + frame.id  + "<br />"
                  	+ "Timestamp: " + frame.timestamp + " &micro;s<br />"
                  	+ "Hands: " + frame.hands.length + "<br />"
                  	+ "Fingers: " + frame.fingers.length + "<br />";

  	// Frame motion factors
  	if (previousFrame)
  	{
	    var translation = frame.translation(previousFrame);
	    frameString += "Translation: " + vectorToString(translation) + " mm <br />";
	
	    var rotationAxis = frame.rotationAxis(previousFrame);
	    var rotationAngle = frame.rotationAngle(previousFrame);
	    frameString += "Rotation axis: " + vectorToString(rotationAxis, 2) + "<br />";
	    frameString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";
	
	    var scaleFactor = frame.scaleFactor(previousFrame);
	    frameString += "Scale factor: " + scaleFactor.toFixed(2) + "<br />";
  	}
  	frameOutput.innerHTML = "<div style='width:300px; float:left; padding:5px'>" + frameString + "</div>";
  	
  	// Display Hand object data
	var handOutput = document.getElementById("handData");
	var handString = "";
	if (frame.hands.length > 0)
	{
		for (var i = 0; i < frame.hands.length; i++)
	    {
			var hand = frame.hands[i];
			
			handString += "<div style='width:300px; float:left; padding:5px'>";
			handString += "Hand ID: " + hand.id + "<br />";
			handString += "Direction: " + vectorToString(hand.direction, 2) + "<br />";
			handString += "Palm normal: " + vectorToString(hand.palmNormal, 2) + "<br />";
			handString += "Palm position: " + vectorToString(hand.palmPosition) + " mm<br />";
			handString += "Palm velocity: " + vectorToString(hand.palmVelocity) + " mm/s<br />";
			handString += "Sphere center: " + vectorToString(hand.sphereCenter) + " mm<br />";
			handString += "Sphere radius: " + hand.sphereRadius.toFixed(1) + " mm<br />";
			handString += "</div>";
		}
	}
	else
	{
		handString += "No hands";
	}
	handOutput.innerHTML = handString;
}

function enableLeap(enableCheckBox)
{
	if (enableCheckBox.checked)
	{
		if (typeof Leap === "undefined")
		{
			
		}
		else
		{
			// Setup Leap loop with frame callback function
			var controllerOptions = {enableGestures: true};
			Leap.loop(controllerOptions, leapCallback)
		}
	}
	else
	{
		
	}
}
