/*******************************************************NOPS©**********************************************************/
/**********************************************************************************************************************/
// - ParameterChanged Callback : HOW TO AVOID RECURSIVE LOOPS
// - Concept: ParameterChanged have a non referenced property named "caller" that get different values depending from where it have been called
// --->
//      ParameterChanged['caller'] == null if the value change come from the UI controls or from SetParameter(p,v)
//      ParameterChanged['caller'] == function from where it have been called if it's called from a user function or another function ion the script
//  
//  So here we test ParameterChanged['caller'], and if it come from UI controls or SetParameter(param, value), we do nothing except 
//  saving this new value in the "previousPluginParametersValue" array and we call SetParameter(p,v) to update the UI and PluginParameters[] array
//  only when change come from any function elsewhere in the script...
//  The "previousPluginParametersValue" array is used to avoid triggering SetParameter() ( and so ParameterChanged() again ) when the new new inputed
//  value is the same as the old one.

//  Use CC 7 and 8 to test.

//create sliders (default range 0.0 - 1.0)
var PluginParameters = [
                        {name:"Slider_1", type:"lin", minValue:0, maxValue:127, numberOfSteps:127, defaultValue:0},
                        {name:"Slider_2", type:"lin", minValue:0, maxValue:127, numberOfSteps:127, defaultValue:0}
                        ];

var previousPluginParametersValue = [];
var noLoop = false;

function ParameterChanged(param, value ) {
    //Trace("caller :" + ParameterChanged['caller']);
    Trace("-----previousPluginParametersValue  : " + previousPluginParametersValue[param] + "\n--------value : " + value + "\n-----GetParameter" + GetParameter(param));
    
    
  if ( param == 1 )
  {
    if ( value !== previousPluginParametersValue[param] )
        {
          Trace("::::::::::::::::::NO CALL::::::::::::::::::::::::");
        }
  
     
    
    
        if ( ParameterChanged['caller'] == null )
        {
        //Trace("ParameterChanged['caller'] == null  : " + GetParameter(param));
          if ( value !== previousPluginParametersValue[param] ) {
            previousPluginParametersValue[param] = value;
            Trace( "::::::::::::::::::::::::::::::::::::::::::::::::\n + PluginParameters From UI: " + GetParameter(param) + "\n::::::::::::::::::::::::::::::::::::::::::::::::" ); 
          }
          else 
          {
            Trace("::::::::::::::::::NO CALL::::::::::::::::::::::::");
          }
        }
        else {
          
          if ( value !== previousPluginParametersValue[param] ) {
            previousPluginParametersValue[param] = value;
            SetParameter(param, value);
            Trace( "::::::::::::::::::::::::::::::::::::::::::::::::\n + PluginParameters From Function: " + GetParameter(param) + "\n::::::::::::::::::::::::::::::::::::::::::::::::" );    
          }
          else 
          {
            Trace("::::::::::::::::::NO CALL::::::::::::::::::::::::");
          }
        }
        
        
    Trace( "::::::::::::::::::END::::::::::::::::::::::::\n + PluginParameters At End: " + GetParameter(param) + "\n::::::::::::::::::::::END:::::::::::::::::::::\n\n" ); 
    }

    else if ( value !== previousPluginParametersValue[param] )// param = 0
    {
   
        noLoop = true;
        var message = "we send back to the calling function this message";
        if (ParameterChanged['caller'] !== null )
        {
            var copyFunk = new Function('return ' + ParameterChanged['caller'])(param, value, message);
        }
        copyFunk(param, value, message);

     }    
}




function HandleMIDI(event)  // CC 7 and 8 are used
{ 
        //Trace("INPUT :" + event.value);
        
        if ( event instanceof ControlChange && event.number == 8 )  // Trigger ParameterChanged() from user function
        {
          TriggerTest(event.number, event.value);
        }
        
        else if ( event instanceof ControlChange && event.number == 7 ) // Passing the function from which ParameterChanged() is called to ParameterChanged()
        {                                                               // The function is in ParameterChanged['caller']
            PassedToParamChanged(event.number, event.value);
        }

}

function TriggerTest(cc, value)
{
    ParameterChanged(cc - 7, value)
}




// What can we do passing a function to ParameterChanged
function PassedToParamChanged(cc, value, message )
{
      if( !noLoop )
      {
       ParameterChanged( cc - 7, value );
        //noLoop = true;
      }

      else
      {
       Trace( "we are back here :-| " + message );
           noLoop = false;
      }
}
