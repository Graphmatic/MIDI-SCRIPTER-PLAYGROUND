/*******************************************************NOPS©**********************************************************/
/**********************************************************************************************************************/
// - ParameterChanged Callback : HOW TO AVOID RECURSIVE LOOPS IF YOU REALLY NEED TO USE SetParameter() or UpdatePluginParameters()
// inside ParameterChanged(), i.e. for cascading parameters changes
// 
// (Since, I've learn that REALLY NOT the right way)
// I keep it here to not forget..
// - Concept: ParameterChanged have a non referenced property named "caller" that get different values depending from where it have been called
// --->
//      ParameterChanged['caller'] == null if the value change come from the UI controls or from SetParameter(p,v)
//      ParameterChanged['caller'] == function from where it have been called if it's called from a user function or another function ion the script
//      (in fact this last thing seems to be more interesting...)
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

function ParameterChanged(param, value ) {
    
    Trace("-----previousPluginParametersValue  : " + previousPluginParametersValue[param] + "\n--------value : " + value + "\n-----GetParameter" + GetParameter(param));
    
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




function HandleMIDI(event) {  // CC 7 and 8 are used

        Trace("INPUT :" + event.value);
        
        if ( event instanceof ControlChange ) 
        {
          TriggerTest(event.number, event.value);
        }
}

function TriggerTest(cc, value)
{
  // It's absoluty not the way to use the Scripter, ParameterChanged() is in fact a callback function
  // triggered by SetParameter();... but hey! it could (painfully) work in this direction too :-)
  ParameterChanged(cc - 7, value)

}
